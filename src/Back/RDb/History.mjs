// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_History
 * @description Persists immutable effective-DEM snapshots and append-only schema application attempts.
 */

/** @implements TeqFw_Db_Back_Api_RDb_History */
export default class TeqFw_Db_Back_RDb_History {
    /** @param {object} deps @param {TeqFw_Db_Back_Dem_Compile} deps.compile */
    constructor({compile}) {
        const snapshotEntity = '/schema/snapshot';
        const applicationEntity = '/schema/application';

        /** @param {any} value @returns {any} */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        /** @param {object} compilation @param {string} entity @returns {object} */
        const tableFor = function (compilation, entity) {
            const table = compilation.physical.tables.find((item) => item.entity === entity);
            if (!table) throw new Error(`The package-owned history entity '${entity}' is absent from the compilation.`);
            return table;
        };

        /** @param {object} deps @param {object} deps.connection @param {object} [deps.transaction] @returns {any} */
        const query = function ({connection, transaction}) {
            const knex = transaction?.getKnexTrx?.() ?? connection?.getClient?.();
            if (!knex) throw new TypeError('A database connection or transaction is required.');
            return knex;
        };

        /** @param {any} value @returns {any} */
        const decode = function (value) {
            if (typeof value !== 'string') return value;
            try {
                return JSON.parse(value);
            } catch {
                throw new Error('Persisted effective-DEM history contains invalid JSON.');
            }
        };

        /** @param {object} row @returns {object} */
        const snapshot = function (row) {
            return freeze({
                createdAt: row.created_at,
                dem: decode(row.dem),
                fingerprint: row.fingerprint,
                id: row.id,
                provenance: decode(row.provenance),
            });
        };

        /** @param {object} row @returns {object} */
        const application = function (row) {
            return freeze({
                completedAt: row.completed_at,
                id: row.id,
                sourceSnapshotId: row.source_snapshot_id,
                startedAt: row.started_at,
                status: row.status,
                targetSnapshotId: row.target_snapshot_id,
            });
        };

        /**
         * Record the immutable effective model for a successful compilation, or return the pre-existing equal snapshot.
         * @param {object} deps
         * @param {object} deps.compilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @param {TeqFw_Db_Back_RDb_ITrans} [deps.transaction]
         * @returns {Promise<object>}
         */
        this.recordSnapshot = async function ({compilation, connection, transaction}) {
            compile.assertResult({value: compilation});
            const knex = query({connection, transaction});
            const table = tableFor(compilation, snapshotEntity).name;
            const effective = compilation.effective;
            const dem = JSON.stringify(effective.model);
            const provenance = JSON.stringify(effective.provenance);
            await knex(table).insert({dem, fingerprint: effective.fingerprint, provenance}).onConflict('fingerprint').ignore();
            const row = await knex(table).where({fingerprint: effective.fingerprint}).first();
            if (!row) throw new Error('Effective-DEM snapshot insert did not produce a readable row.');
            if (row.dem !== dem || row.provenance !== provenance) {
                const error = new Error('An existing snapshot fingerprint has different immutable content.');
                error.name = 'DemSnapshotIntegrityError';
                throw freeze(error);
            }
            return snapshot(row);
        };

        /**
         * Start a schema application attempt from the known last-applied snapshot to a recorded target snapshot.
         * @param {object} deps
         * @param {object} deps.compilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @param {number|null} deps.sourceSnapshotId
         * @param {number} deps.targetSnapshotId
         * @param {TeqFw_Db_Back_RDb_ITrans} [deps.transaction]
         * @returns {Promise<object>}
         */
        this.startApplication = async function ({compilation, connection, sourceSnapshotId = null, targetSnapshotId, transaction}) {
            compile.assertResult({value: compilation});
            if (!Number.isSafeInteger(targetSnapshotId) || targetSnapshotId <= 0) {
                throw new TypeError('A positive targetSnapshotId is required.');
            }
            if (sourceSnapshotId !== null && (!Number.isSafeInteger(sourceSnapshotId) || sourceSnapshotId <= 0)) {
                throw new TypeError('sourceSnapshotId must be null or a positive integer.');
            }
            const knex = query({connection, transaction});
            const snapshots = tableFor(compilation, snapshotEntity).name;
            const applications = tableFor(compilation, applicationEntity).name;
            const target = await knex(snapshots).where({id: targetSnapshotId}).first();
            if (!target) throw new Error(`Target snapshot '${targetSnapshotId}' does not exist.`);
            if (sourceSnapshotId !== null && !await knex(snapshots).where({id: sourceSnapshotId}).first()) {
                throw new Error(`Source snapshot '${sourceSnapshotId}' does not exist.`);
            }
            const last = await knex(applications).where({status: 'applied'}).orderBy('completed_at', 'desc').orderBy('id', 'desc').first();
            if ((last?.target_snapshot_id ?? null) !== sourceSnapshotId) {
                throw new Error('sourceSnapshotId must equal the last successfully applied snapshot, or be null for first-time creation.');
            }
            const [id] = await knex(applications).insert({source_snapshot_id: sourceSnapshotId, status: 'started', target_snapshot_id: targetSnapshotId});
            const row = await knex(applications).where({id: typeof id === 'object' ? id.id : id}).first();
            if (!row) throw new Error('Schema application insert did not produce a readable row.');
            return application(row);
        };

        /**
         * Compare the declared physical projection with the active connection catalog without inferring a migration.
         * @param {object} deps
         * @param {object} deps.compilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @returns {Promise<object>}
         */
        this.validateCatalog = async function ({compilation, connection}) {
            compile.assertResult({value: compilation});
            if (!connection?.getSchemaBuilder || !connection?.getClient) throw new TypeError('A database connection is required.');
            const diagnostics = [];
            for (const table of compilation.physical.tables) {
                const exists = await connection.getSchemaBuilder().hasTable(table.name);
                if (!exists) {
                    diagnostics.push({code: 'DEM_CATALOG_TABLE_MISSING', details: {entity: table.entity, table: table.name}});
                    continue;
                }
                const actual = await connection.getClient()(table.name).columnInfo();
                const expectedNames = new Set(table.columns.map((column) => column.name));
                for (const name of expectedNames) {
                    if (!Object.hasOwn(actual, name)) diagnostics.push({
                        code: 'DEM_CATALOG_COLUMN_MISSING', details: {column: name, entity: table.entity, table: table.name},
                    });
                }
                for (const name of Object.keys(actual).sort()) {
                    if (!expectedNames.has(name)) diagnostics.push({
                        code: 'DEM_CATALOG_COLUMN_UNEXPECTED', details: {column: name, entity: table.entity, table: table.name},
                    });
                }
            }
            return freeze({diagnostics, matches: diagnostics.length === 0});
        };

        /**
         * Mark a started attempt as applied only after its target fingerprint and physical projection have been verified.
         * @param {object} deps
         * @param {number} deps.applicationId
         * @param {object} deps.compilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @param {TeqFw_Db_Back_RDb_ITrans} [deps.transaction]
         * @returns {Promise<object>}
         */
        this.completeApplication = async function ({applicationId, compilation, connection, transaction}) {
            compile.assertResult({value: compilation});
            const knex = query({connection, transaction});
            const snapshots = tableFor(compilation, snapshotEntity).name;
            const applications = tableFor(compilation, applicationEntity).name;
            const row = await knex(applications).where({id: applicationId}).first();
            if (!row) throw new Error(`Schema application '${applicationId}' does not exist.`);
            if (row.status !== 'started') throw new Error('Only a started schema application may be completed.');
            const target = await knex(snapshots).where({id: row.target_snapshot_id}).first();
            if (!target || target.fingerprint !== compilation.effective.fingerprint) {
                throw new Error('The claimed applied compilation does not match the application target snapshot.');
            }
            const catalog = await this.validateCatalog({compilation, connection});
            if (!catalog.matches) {
                const error = new Error('The claimed applied snapshot does not match the active database catalog.');
                error.name = 'DemCatalogMismatchError';
                Object.defineProperty(error, 'diagnostics', {enumerable: true, value: catalog.diagnostics});
                throw freeze(error);
            }
            await knex(applications).where({id: applicationId, status: 'started'}).update({completed_at: new Date().toISOString(), status: 'applied'});
            return application(await knex(applications).where({id: applicationId}).first());
        };

        /**
         * Mark a started application attempt as failed. Completed history is never rewritten.
         * @param {object} deps
         * @param {number} deps.applicationId
         * @param {object} deps.compilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @param {TeqFw_Db_Back_RDb_ITrans} [deps.transaction]
         * @returns {Promise<object>}
         */
        this.failApplication = async function ({applicationId, compilation, connection, transaction}) {
            compile.assertResult({value: compilation});
            const knex = query({connection, transaction});
            const applications = tableFor(compilation, applicationEntity).name;
            const row = await knex(applications).where({id: applicationId}).first();
            if (!row) throw new Error(`Schema application '${applicationId}' does not exist.`);
            if (row.status !== 'started') throw new Error('Only a started schema application may be failed.');
            await knex(applications).where({id: applicationId, status: 'started'}).update({completed_at: new Date().toISOString(), status: 'failed'});
            return application(await knex(applications).where({id: applicationId}).first());
        };

        /**
         * Resolve the last successfully applied snapshot and its immutable application record.
         * @param {object} deps
         * @param {object} deps.compilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @param {TeqFw_Db_Back_RDb_ITrans} [deps.transaction]
         * @returns {Promise<object|null>}
         */
        this.resolveLastApplied = async function ({compilation, connection, transaction}) {
            compile.assertResult({value: compilation});
            const knex = query({connection, transaction});
            const snapshots = tableFor(compilation, snapshotEntity).name;
            const applications = tableFor(compilation, applicationEntity).name;
            const row = await knex(applications).where({status: 'applied'}).orderBy('completed_at', 'desc').orderBy('id', 'desc').first();
            if (!row) return null;
            const target = await knex(snapshots).where({id: row.target_snapshot_id}).first();
            if (!target) throw new Error('Applied schema history references a missing snapshot.');
            return freeze({application: application(row), snapshot: snapshot(target)});
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({compile: 'TeqFw_Db_Back_Dem_Compile$'}),
});
