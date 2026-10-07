// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Identity
 * @description Allocates exact entity identities in the caller's active transaction.
 */

/** @type {WeakMap<TeqFw_Db_KnexTransaction, Promise<void>>} */
const pending = new WeakMap();

export default class TeqFw_Db_Back_RDb_Identity {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_DemCompiler} deps.compile
     * @param {typeof import('node:crypto').createHash} deps.createHash
     */
    constructor({compile, createHash}) {
        const counterEntity = '/teqfw/db/schema/identitycounter';

        /** @param {unknown} value @param {boolean} [nonnegative] @returns {number} */
        const exactInteger = function (value, nonnegative = true) {
            const number = typeof value === 'string' && /^(0|-?[1-9][0-9]*)$/.test(value) ? Number(value) : value;
            if (typeof number !== 'number' || !Number.isSafeInteger(number) || nonnegative && number < 0) {
                throw new TypeError('Identity values must be exact safe integers; counters must also be non-negative.');
            }
            return number;
        };

        /** @param {TeqFw_Db_PhysicalTable} table @returns {TeqFw_Db_PhysicalColumnArray} */
        const allocatedColumns = function (table) {
            return table.columns.filter((column) => column.generation?.implementation === 'allocated');
        };

        /**
         * Validate allocation prerequisites without touching database state.
         * @param {object} deps
         * @param {TeqFw_Db_DemCompilationResult} deps.compilation
         * @returns {TeqFw_Db_PhysicalTableOptional}
         */
        this.assertCompilation = function ({compilation}) {
            compile.assertResult({value: compilation});
            if (!compilation.physical.tables.some((table) => allocatedColumns(table).length)) return undefined;
            const counter = compilation.physical.tables.find((table) => table.entity === counterEntity);
            const scope = counter?.columns.find((column) => column.name === 'scope');
            const path = counter?.columns.find((column) => column.name === 'entity_path');
            const value = counter?.columns.find((column) => column.name === 'value');
            const primary = compilation.physical.phases.tables.find((index) => index.entity === counterEntity && index.kind === 'primary');
            if (!counter || counter.columns.length !== 3 || counter.columns.some((column) => column.nullable || column.generation)
                || scope?.logicalType.id !== 'core.string' || scope.logicalType.params?.length !== 64
                || path?.logicalType.id !== 'core.text' || value?.logicalType.id !== 'core.integer'
                || value.logicalType.params?.bits !== 64 || value.logicalType.params?.unsigned !== false
                || primary?.keys.length !== 1 || primary.keys[0].attr !== 'scope') {
                throw new TypeError('Allocated identities require the ordinary package-owned identitycounter DEM entity.');
            }
            return counter;
        };

        /**
         * @param {TeqFw_Db_IdentitySyncInput} input
         * @returns {Promise<TeqFw_Db_KnexTransaction>}
         */
        const transactionFor = async function (input) {
            const {compilation, transaction} = input;
            const knex = transaction?.getKnexTrx?.();
            if (typeof knex !== 'function' || knex.isTransaction !== true || typeof knex.isCompleted !== 'function' || knex.isCompleted()) {
                throw new TypeError('An active caller-owned database transaction is required for identity allocation.');
            }
            const adapter = transaction.getDialectAdapter();
            const description = await adapter.describe();
            if (description.id !== compilation.physical.adapter || !['sqlite', 'postgresql', 'mysql'].includes(description.id)) {
                throw new TypeError('The identity allocation transaction must match the compiled supported dialect.');
            }
            const preflight = await adapter.preflight({
                connection: transaction, fingerprint: compilation.fingerprint,
                operation: 'allocate', requirements: compilation.requirements,
            });
            if (preflight.diagnostics.length) throw new Error('Identity allocation capability preflight failed.');
            return knex;
        };

        /**
         * Serialize calls even across service instances sharing a transaction.
         * @param {TeqFw_Db_KnexTransaction} knex
         * @returns {Promise<TeqFw_Db_Release>}
         */
        const acquire = async function (knex) {
            const previous = pending.get(knex) ?? Promise.resolve();
            /** @type {TeqFw_Db_Release} */
            let releaseGate = function () {};
            /** @type {Promise<void>} */
            const gate = new Promise((resolve) => { releaseGate = resolve; });
            pending.set(knex, gate);
            await previous;
            return function () {
                releaseGate();
                if (pending.get(knex) === gate) pending.delete(knex);
            };
        };

        /**
         * @param {TeqFw_Db_KnexTransaction} knex
         * @param {TeqFw_Db_PhysicalTable} counter
         * @param {TeqFw_Db_PhysicalTable} table
         * @param {TeqFw_Db_PhysicalColumn} column
         * @param {string} dialect
         * @param {boolean} increment
         * @returns {Promise<number>}
         */
        const update = async function (knex, counter, table, column, dialect, increment) {
            if (knex.isCompleted()) throw new TypeError('The identity allocation transaction is completed.');
            const bits = column.logicalType.params?.bits;
            const unsigned = column.logicalType.params?.unsigned;
            if (column.logicalType.id !== 'core.integer' || (bits !== 32 && bits !== 64) || typeof unsigned !== 'boolean') {
                throw new TypeError('Allocated identities require a supported concrete integer identity profile.');
            }
            const limit = bits === 64 ? Number.MAX_SAFE_INTEGER : unsigned ? 2 ** 32 - 1 : 2 ** 31 - 1;
            const scope = createHash('sha256').update(table.entity).digest('hex');
            // Conflict-update locks the scope without resetting its high-water mark.
            await knex(counter.name).insert({scope, entity_path: table.entity, value: 0}).onConflict('scope').merge({scope});
            const read = knex(counter.name).where({scope});
            if (dialect !== 'sqlite') read.forUpdate();
            const row = /** @type {TeqFw_Db_IdentityCounterRow | undefined} */ (await read.first());
            if (!row || row.entity_path !== table.entity) throw new Error('Identity counter scope integrity check failed.');
            const current = exactInteger(row.value);
            const maximumRow = await knex(table.name).max({maximum: column.name}).first();
            const maximum = maximumRow?.maximum === null || maximumRow?.maximum === undefined ? 0 : Math.max(0, exactInteger(maximumRow.maximum, false));
            if (current > limit || maximum > limit) throw new RangeError('Persisted identity state exceeds the supported identity range.');
            // Imported explicit IDs may raise the counter, but deletion never lowers it.
            await knex(counter.name).where({scope}).where('value', '<', maximum).update({value: maximum});
            if (!increment) return Math.max(current, maximum);
            const changed = await knex(counter.name).where({scope}).where('value', '<', limit).increment('value', 1);
            if (changed !== 1) throw new RangeError('Identity allocation range is exhausted.');
            const allocated = /** @type {TeqFw_Db_IdentityCounterRow | undefined} */ (await knex(counter.name).where({scope}).first());
            if (!allocated || allocated.entity_path !== table.entity) throw new Error('Identity counter scope integrity check failed.');
            const result = exactInteger(allocated.value);
            if (result <= Math.max(current, maximum) || result > limit) throw new Error('Identity counter increment integrity check failed.');
            return result;
        };

        /** @param {TeqFw_Db_IdentityInput} input @returns {Promise<number>} */
        this.allocate = async function (input) {
            const {compilation, transaction, entity} = input;
            const counter = this.assertCompilation({compilation});
            const table = compilation.physical.tables.find((item) => item.entity === entity);
            const columns = table ? allocatedColumns(table) : [];
            if (!counter || !table || columns.length !== 1) throw new TypeError('Allocation requires a canonical entity with one allocated identity.');
            const knex = await transactionFor({compilation, transaction});
            const release = await acquire(knex);
            try { return await update(knex, counter, table, columns[0], compilation.physical.adapter, true); }
            finally { release(); }
        };

        /**
         * Reconcile imported explicit IDs with durable counter high-water marks in the same transaction.
         * @param {TeqFw_Db_IdentitySyncInput} input
         * @returns {Promise<TeqFw_Db_IdentityCounterEvidenceArray>}
         */
        this.synchronize = async function (input) {
            const {compilation, transaction} = input;
            const counter = this.assertCompilation({compilation});
            if (!counter) return Object.freeze([]);
            const knex = await transactionFor({compilation, transaction});
            const release = await acquire(knex);
            try {
                /** @type {TeqFw_Db_IdentityCounterEvidence[]} */
                const evidence = [];
                for (const table of compilation.physical.tables) {
                    const columns = allocatedColumns(table);
                    if (!columns.length) continue;
                    if (columns.length !== 1) throw new TypeError('An entity must have one allocated identity.');
                    const value = await update(knex, counter, table, columns[0], compilation.physical.adapter, false);
                    evidence.push(Object.freeze({entity: table.entity, value}));
                }
                return Object.freeze(evidence);
            } finally { release(); }
        };
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        compile: 'TeqFw_Db_Back_Dem_Compile$',
        createHash: 'node:crypto__createHash',
    }),
});
