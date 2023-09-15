/**
 * RDBMS connector (based on 'knex' connector).
 *
 * @namespace TeqFw_Db_Back_RDb_Connect
 */
// MODULE'S IMPORT
import knex from 'knex';

/**
 * Default implementation for 'knex' based database connector.
 * @implements TeqFw_Db_Back_RDb_IConnect
 */
export default class TeqFw_Db_Back_RDb_Connect {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} _logger -  instance
     * @param {TeqFw_Db_Back_RDb_Connect_Resolver} _resolver -  instance per connection
     * @param {typeof TeqFw_Db_Back_RDb_Trans} Trans
     */

    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: _logger,
            TeqFw_Db_Back_RDb_Connect_Resolver$$: _resolver,
            'TeqFw_Db_Back_RDb_Trans#': Trans,
        }) {
        // VARS
        /** @type {Knex} */
        let _knex;
        /** @type {string} */
        let _info;

        // INSTANCE METHODS
        /**
         * Initialize connection to database.
         *
         * @param {TeqFw_Db_Back_Dto_Config_Local|Knex.Config} cfg
         * @returns {Promise<void>}
         */
        this.init = async function (cfg) {
            // to prevent 'Cannot redefine property: password'
            const clone = JSON.parse(JSON.stringify(cfg));
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
                _knex = await knex(clone);
                _logger.info(`Setup connection to DB ${_info}.`);
            } catch (e) {
                _logger.error(`Cannot setup connection to DB ${_info}. Error: ${e}`);
                throw e;
            }
        };

        this.startTransaction = async function (opts) {
            const trx = await _knex.transaction(opts);
            return new Trans({resolver: _resolver, trx});
        };
        /**
         * Set schema configuration for current connection.
         * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
         */
        this.setSchemaConfig = function (cfg) {
            _resolver.setConfig(cfg);
        };
        /**
         * Accessor for 'knex' object.
         *
         * @returns {*}
         * @deprecated this is hard binding to the lib, we should use more lib-independent naming
         */
        this.getKnex = function () {
            return _knex;
        };

        /**
         * Accessor for 'knex.schema' object.
         * (empty array is returned for async function)
         * @returns {SchemaBuilder}
         */
        this.getSchemaBuilder = function () {
            return _knex?.schema;
        };

        this.disconnect = async function () {
            const pool = _knex?.client?.pool;
            if (pool) {
                return new Promise(function (resolve) {
                    const WAIT = 100;

                    /**
                     * Check DB connections in loop and close all when all connections will be released.
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
                            await _knex.destroy();
                            _logger.info(`Connections to ${_info} are closed.`);
                            resolve();
                        }
                    }

                    setTimeout(checkPool, WAIT);
                });
            }
        };
    }
}
