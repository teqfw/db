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

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Core_Shared_Logger} */
        const _logger = spec['TeqFw_Core_Shared_Logger$'];
        /** @type {TeqFw_Db_Back_RDb_Connect_Resolver} */
        const _resolver = spec['TeqFw_Db_Back_RDb_Connect_Resolver$$']; // instance per connection
        /** @type {typeof TeqFw_Db_Back_RDb_Trans} */
        const Trans = spec['TeqFw_Db_Back_RDb_Trans#'];

        // DEFINE WORKING VARS / PROPS
        /** @type {Knex} */
        let _knex;
        let _db;

        // DEFINE INSTANCE METHODS
        /**
         * Initialize connection to database.
         *
         * @param {TeqFw_Db_Back_Dto_Config_Local|Knex.Config} cfg
         * @returns {Promise<void>}
         */
        this.init = async function (cfg) {
            _db = cfg.connection.database + '@' + cfg.connection.host;
            const user = cfg.connection.user;
            try {
                _knex = await knex(cfg);
                _logger.info(`Setup connection to DB '${_db}' as '${user}'.`);
            } catch (e) {
                _logger.error(`Cannot setup connection to DB '${_db}' as '${user}'. Error: ${e}`);
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
        }
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
            return _knex.schema;
        };

        this.disconnect = async function () {
            const pool = _knex.client.pool;
            return new Promise(function (resolve) {
                const WAIT = 100;

                /**
                 * Check DB connections in loop and close all when all connections will be released.
                 */
                function checkPool() {
                    const acquires = pool.numPendingAcquires();
                    const creates = pool.numPendingCreates();
                    const pending = acquires + creates;
                    if (pending > 0) {
                        // wait until all connections will be released
                        setTimeout(checkPool, WAIT);
                    } else {
                        // close all connections
                        _knex.destroy();
                        _logger.info(`Connections to '${_db}' are closed.`);
                        resolve();
                    }
                }

                setTimeout(checkPool, WAIT);
            });

        };
    }
}
