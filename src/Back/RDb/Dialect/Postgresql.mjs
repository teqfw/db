// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Postgresql
 * @description PostgreSQL core physical projection adapter with explicit frozen registries.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Postgresql {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Dialect_Knex} deps.knex
     * @param {TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector} deps.vector
     */
    constructor({knex, vector}) {
        const capability = 'postgresql.core';
        /** @param {string|Function} type @param {Function} args @param {Function} unsigned @param {Function} validate @returns {object} */
        const entry = function (type, args = () => [], unsigned = () => false, validate = () => []) {
            return {
                bindingParams: [],
                requirements: [capability],
                project: function ({logicalType}) {
                    const diagnostics = validate(logicalType);
                    const physicalType = typeof type === 'function' ? type(logicalType) : type;
                    return {
                        diagnostics,
                        physicalType: diagnostics.length ? undefined : {
                            dialect: 'postgresql', type: physicalType, args: args(logicalType), unsigned: unsigned(logicalType),
                        },
                    };
                },
            };
        };
        /** @param {string} type @param {Function} project @returns {object} */
        const legacy = function (type, project = () => ({})) {
            return {
                requirements: [capability],
                project: function ({compatibility, logicalType}) {
                    const value = project({compatibility, logicalType});
                    const {compatibilitySignature, ...physical} = value;
                    return {
                        compatibilitySignature,
                        physicalType: {dialect: 'postgresql', type, args: [], unsigned: false, ...physical},
                    };
                },
            };
        };
        /** @param {object} type @returns {ReadonlyArray<object>} */
        const rejectUnsigned = (type) => type.params.unsigned ? [{
            code: 'DEM_STORAGE_UNSUPPORTED',
            details: {adapter: 'postgresql', type: type.id},
            message: 'PostgreSQL has no registered exact unsigned numeric storage mapping.',
        }] : [];
        const types = {
            'core.binary': entry('binary', (type) => type.params.length ? [type.params.length] : []),
            'core.boolean': entry('boolean'),
            'core.date': entry('date'),
            'core.datetime': entry('datetime', (type) => [{precision: type.params.precision, useTz: type.params.timezone}]),
            'core.decimal': entry('decimal', (type) => [type.params.precision, type.params.scale], (type) => type.params.unsigned, rejectUnsigned),
            'core.enum': entry('enum', (type) => [type.params.values]),
            'core.integer': entry((type) => ({8: 'smallint', 16: 'smallint', 32: 'integer', 64: 'bigint'}[type.params.bits]), () => [], (type) => type.params.unsigned, rejectUnsigned),
            'core.json': entry('jsonb'),
            'core.string': entry('string', (type) => [type.params.length]),
            'core.text': entry('text'),
            'core.uuid': entry('uuid'),
            'legacy.binary': legacy('binary', ({logicalType}) => ({args: logicalType.params.length ? [logicalType.params.length] : []})),
            'legacy.boolean': legacy('boolean'),
            'legacy.date': legacy('date'),
            'legacy.datetime': legacy('datetime'),
            'legacy.decimal': legacy('decimal', ({compatibility, logicalType}) => ({args: [compatibility.precision ?? undefined, compatibility.scale ?? undefined], unsigned: logicalType.params.unsigned})),
            'legacy.enum': legacy('enum', ({logicalType}) => ({args: [logicalType.params.values]})),
            'legacy.increments': legacy('increments', () => ({compatibilitySignature: 'legacy.integer-reference'})),
            'legacy.integer': legacy('integer', ({logicalType}) => ({unsigned: logicalType.params.unsigned})),
            'legacy.integerUnsigned': legacy('integer', () => ({unsigned: true, compatibilitySignature: 'legacy.integer-reference'})),
            'legacy.jsonb': legacy('jsonb'),
            'legacy.string': legacy('string', ({compatibility, logicalType}) => ({args: [compatibility.declaredLength ?? logicalType.params.length]})),
            'legacy.text': legacy('text'),
            'legacy.tinyint': legacy('tinyint', ({logicalType}) => ({unsigned: logicalType.params.unsigned})),
        };
        const storage = {
            binary: types['core.binary'],
            boolean: types['core.boolean'],
            date: types['core.date'],
            datetime: types['core.datetime'],
            decimal: types['core.decimal'],
            enum: types['core.enum'],
            integer: types['core.integer'],
            json: entry('json'),
            jsonb: entry('jsonb'),
            string: types['core.string'],
            text: types['core.text'],
            uuid: types['core.uuid'],
            ...vector.getStorageRegistry(),
        };
        const indexes = {
            'legacy.defaultIndex': {
                requirements: [capability],
                project: function ({index, physicalName}) {
                    return {
                        descriptor: {
                            include: [], keys: structuredClone(index.keys), kind: index.kind, method: 'index',
                            name: physicalName, options: {},
                        },
                    };
                },
            },
        };
        indexes['core.btree'] = indexes['legacy.defaultIndex'];
        Object.assign(indexes, vector.getIndexRegistry());
        const adapter = knex.createAdapter({
            description: {
                id: 'postgresql',
                clients: ['pg', 'pg-native', 'postgres', 'postgresql'],
                registryVersions: {core: 1, legacy: 1, pgvector: '0.7'},
                supportedCapabilities: [capability, 'postgresql.transfer.deferredConstraints', ...vector.getCapabilities()],
            },
            defaults: {
                'core.currentDate': {implementation: 'currentDate', requirements: [capability], types: ['core.date']},
                'core.currentTimestamp': {implementation: 'currentTimestamp', requirements: [capability], types: ['core.datetime']},
            },
            generations: {
                'core.identity': {
                    implementation: 'identity',
                    modes: ['byDefault'],
                    bits: [32, 64],
                    requirements: [capability],
                    types: ['core.integer'],
                },
            },
            indexes,
            storage,
            types,
        });
        Object.assign(this, adapter);
        const baseAddColumn = this.addColumn;
        const baseAddIndex = this.addIndex;
        const baseCompileExpression = this.compileExpression;
        const baseDecodeValue = this.decodeValue;
        const baseEncodeValue = this.encodeValue;
        const basePreflight = this.preflight;
        const baseResolveOperator = this.resolveOperator;
        /** @param {object} args @returns {any} */
        this.addColumn = function (args) {
            return vector.addColumn({...args, base: baseAddColumn});
        };
        /** @param {object} args @returns {Promise<void>} */
        this.addIndex = async function (args) {
            await vector.addIndex({...args, base: baseAddIndex});
        };
        /** @param {object} args @returns {Promise<void>} */
        this.applyExecutionOptions = async function (args) {
            await vector.applyExecutionOptions(args);
        };
        /** @param {object} args @returns {any} */
        this.compileExpression = function (args) {
            return vector.compileExpression(args) ?? baseCompileExpression(args);
        };
        /** @param {object} args @returns {any} */
        this.decodeValue = function (args) {
            return args.column?.logicalType?.id === 'core.vector'
                ? vector.decodeValue(args) : baseDecodeValue(args);
        };
        /** @param {object} args @returns {any} */
        this.encodeValue = function (args) {
            return args.column?.logicalType?.id === 'core.vector'
                ? vector.encodeValue(args) : baseEncodeValue(args);
        };
        /** @param {object} args @returns {Promise<object>} */
        this.preflight = async function (args) {
            return vector.preflight({...args, base: basePreflight});
        };
        /** @param {object} args @returns {Promise<object>} */
        this.resolveOperator = async function (args) {
            return vector.resolveOperator(args) ?? baseResolveOperator(args);
        };
        /**
         * @param {object} deps
         * @param {object} deps.cycleStrategy
         * @param {object} deps.transaction
         * @returns {Promise<object>}
         */
        this.prepareTransfer = async function ({cycleStrategy, transaction}) {
            if (!cycleStrategy) return Object.freeze({strategy: null});
            if (cycleStrategy.id !== 'postgresql.deferredConstraints') {
                throw new TypeError('PostgreSQL transfer strategy is not registered.');
            }
            await transaction.getKnexTrx().raw('SET CONSTRAINTS ALL DEFERRED');
            return Object.freeze({strategy: cycleStrategy.id});
        };
        /**
         * @param {object} deps
         * @param {ReadonlyArray<object>} deps.tables
         * @param {object} deps.transaction
         * @returns {Promise<any>}
         */
        this.restoreGeneratedState = async function ({tables, transaction}) {
            const knex = transaction.getKnexTrx();
            const evidence = [];
            for (const table of tables) {
                for (const column of table.columns.filter((item) => item.generation?.implementation === 'identity')) {
                    const sequenceResult = await knex.raw('select pg_get_serial_sequence(?, ?) as sequence', [table.name, column.name]);
                    const sequence = sequenceResult.rows?.[0]?.sequence;
                    if (!sequence) continue;
                    const maximumResult = await knex.raw('select max(??) as maximum, count(*) as count from ??', [column.name, table.name]);
                    const row = maximumResult.rows?.[0] ?? {};
                    const hasRows = Number(row.count) > 0;
                    const maximum = hasRows ? row.maximum : 1;
                    await knex.raw('select setval(?::regclass, ?, ?)', [sequence, maximum, hasRows]);
                    evidence.push(Object.freeze({column: column.name, sequence, table: table.name, value: maximum}));
                }
            }
            return Object.freeze(evidence);
        };
        /**
         * @param {object} deps
         * @param {ReadonlyArray<object>} deps.cycles
         * @param {object} deps.strategy
         * @returns {object}
         */
        this.validateCycleStrategy = function ({cycles, strategy}) {
            const valid = strategy?.id === 'postgresql.deferredConstraints'
                && cycles.every((cycle) => cycle.relations.every((relation) => relation.deferrable === 'deferred'));
            return Object.freeze({
                diagnostics: [],
                requirements: valid ? Object.freeze(['postgresql.transfer.deferredConstraints']) : Object.freeze([]),
                valid,
            });
        };
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        knex: 'TeqFw_Db_Back_RDb_Dialect_Knex$',
        vector: 'TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector$',
    }),
});
