// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Connect
 * @description TeqFW database package module.
 */

/**
 * RDBMS connector (based on 'knex' connector).
 *
 * @namespace TeqFw_Db_Back_RDb_Connect
 */
/**
 * Default implementation for 'knex' based database connector.
 * @implements TeqFw_Db_Back_RDb_IConnect
 */
export default class TeqFw_Db_Back_RDb_Connect {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Dialect_Registry} deps._dialects
     * @param {TeqFw_Log_Provider} deps.logger
     * @param {TeqFw_Db_Back_RDb_Connect_Resolver} deps._resolver
     * @param {TeqFw_Db_Back_RDb_Trans__Class} deps.Trans
     * @param {object} deps.knexFactory
     */
    constructor({_dialects, logger, _resolver, Trans, knexFactory}) {
        const log = logger.forSource('TeqFw_Db_Back_RDb_Connect');
        // VARS
        /** @type {any} */
        let _knex;
        /** @type {string} */
        let _info;
        /** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
        let _adapter;

        // INSTANCE METHODS
        /**
         * Initialize connection to database.
         * @param {any} cfg
         * @returns {Promise<void>}
         */
        this.init = async function (cfg) {
            // to prevent 'Cannot redefine property: password'
            const clone = JSON.parse(JSON.stringify(cfg));
            const adapter = _dialects.select({client: clone.client});
            const filename = clone?.connection?.filename;
            if (filename) {
                _info = `'${filename}'`;
            } else {
                const db = clone?.connection?.database;
                const host = clone?.connection?.host;
                const user = clone?.connection?.user;
                _info = `'${db}@${host}' as '${user}'`;
            }
            try {
                _knex = await knexFactory(clone);
                _adapter = adapter;
                log.info(`Setup connection to DB ${_info}.`);
            } catch (e) {
                log.error(`Cannot setup connection to DB ${_info}.`, {err: e});
                throw e;
            }
        };

        /**
         * Get the immutable dialect selected by the configured Knex client.
         * @returns {TeqFw_Db_Back_Api_RDb_Dialect}
         */
        this.getDialectAdapter = function () {
            if (!_adapter) throw new Error("The database connection is not initialized.");
            return _adapter;
        };

        /**
         * @param {any} opts
         * @returns {Promise<any>}
         */
        this.startTransaction = async function (opts) {
            const trx = await _knex.transaction(opts);
            return new Trans({adapter: _adapter, resolver: _resolver, trx});
        };
        /**
         * Set schema configuration for current connection.
         * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
         */
        this.setSchemaConfig = function (cfg) {
            _resolver.setConfig(cfg);
        };
        /**
         * Accessor for the underlying database client.
         * @returns {any}
         */
        this.getClient = function () {
            return _knex;
        };

        /**
         * Accessor for 'knex.schema' object.
         * (empty array is returned for async function)
         * @returns {any}
         */
        this.getSchemaBuilder = function () {
            return _knex?.schema;
        };

        /**
         * @returns {Promise<any>}
         */
        this.disconnect = async function () {
            const pool = _knex?.client?.pool;
            if (pool) {
                return new Promise(function (resolve) {
                    const WAIT = 100;

                    /**
                     * Check DB connections in loop and close all when all connections will be released.
                     * @returns {Promise<void>}
                     */
                    async function checkPool() {
                        const acquires = pool.numPendingAcquires();
                        const creates = pool.numPendingCreates();
                        const pending = acquires + creates;
                        if (pending > 0) {
                            // wait until all connections will be released
                            setTimeout(checkPool, WAIT);
                        } else {
                            // close all connections
                            _knex.destroy()
                                .then(() => {
                                    log.info(`Connections to ${_info} are closed.`);
                                    resolve();
                                })
                                .catch((e) => {
                                    log.error('Cannot close database connections.', {err: e});
                                    resolve();
                                });
                        }
                    }

                    setTimeout(checkPool, WAIT);
                });
            }
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            _dialects: 'TeqFw_Db_Back_RDb_Dialect_Registry$',
            logger: 'TeqFw_Log_Provider$',
            _resolver: 'TeqFw_Db_Back_RDb_Connect_Resolver$$',
            Trans: 'TeqFw_Db_Back_RDb_Trans__default',
            knexFactory: 'npm:knex__default',
    }),
});
