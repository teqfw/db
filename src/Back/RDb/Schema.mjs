// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema
 * @description Executes schema operations only from an authentic compiled physical plan.
 */

/**
 * @implements TeqFw_Db_Back_Api_RDb_Schema
 */
export default class TeqFw_Db_Back_RDb_Schema {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Compile} deps._compile
     * @param {TeqFw_Log_Provider} deps.logger
     * @param {TeqFw_Db_Back_RDb_Schema_A_Builder} deps._builder
     * @param {TeqFw_Db_Back_RDb_Schema_A_Plan} deps._plan
     */
    constructor({_compile, logger, _builder, _plan}) {
        const log = logger.forSource('TeqFw_Db_Back_RDb_Schema');
        /** @type {object} */
        let _compilation;

        /**
         * @returns {object}
         */
        const getCompilation = function () {
            return _compile.assertResult({value: _compilation});
        };

        /**
         * @param {TeqFw_Db_Back_RDb_IConnect} conn
         * @param {object} compilation
         * @returns {Promise<TeqFw_Db_Back_Api_RDb_Dialect>}
         */
        const getAdapter = async function (conn, compilation) {
            const adapter = conn.getDialectAdapter();
            const description = await adapter.describe();
            if (description.id !== compilation.physical.adapter) {
                throw new TypeError(`Compilation adapter '${compilation.physical.adapter}' does not match connection adapter '${description.id}'.`);
            }
            return adapter;
        };

        /**
         * @param {object} deps
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
         * @returns {Promise<object>}
         */
        this.createAllTables = async function ({conn}) {
            const compilation = getCompilation();
            const adapter = await getAdapter(conn, compilation);
            const plan = _plan.exec({compilation, operation: 'create'});
            log.info(`Creating ${plan.phases.tables.length} compiled DEM tables.`);
            return _builder.exec({adapter, connection: conn, plan});
        };

        /**
         * @param {object} deps
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
         * @returns {Promise<object>}
         */
        this.dropAllTables = async function ({conn}) {
            const compilation = getCompilation();
            const adapter = await getAdapter(conn, compilation);
            const plan = _plan.exec({compilation, operation: 'drop'});
            log.info(`Dropping ${plan.phases.tables.length} compiled DEM tables.`);
            return _builder.exec({adapter, connection: conn, plan});
        };

        /**
         * @returns {Promise<any>}
         */
        this.fetchTablesByDependencyOrder = async function () {
            const compilation = getCompilation();
            const byEntity = Object.fromEntries(compilation.physical.tables.map((table) => [table.entity, table]));
            return Object.freeze(compilation.graph.topological.map((entity) => byEntity[entity]).filter(Boolean));
        };

        /**
         * @returns {Promise<any>}
         */
        this.getTablesList = async function () {
            return Object.freeze((await this.fetchTablesByDependencyOrder()).map((table) => table.name));
        };

        /**
         * @param {object} deps
         * @param {object} deps.compilation
         */
        this.setCompilation = function ({compilation}) {
            _compilation = _compile.assertResult({value: compilation});
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        _compile: 'TeqFw_Db_Back_Dem_Compile$',
        logger: 'TeqFw_Log_Provider$',
        _builder: 'TeqFw_Db_Back_RDb_Schema_A_Builder$',
        _plan: 'TeqFw_Db_Back_RDb_Schema_A_Plan$',
    }),
});
