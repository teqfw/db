/**
 * RDBMS connector (based on 'knex' connector).
 *
 * @namespace TeqFw_Db_Back_RDb_Connect
 */
// MODULE'S IMPORT
import $knex from 'knex';

/**
 * Default implementation for 'knex' based database connector.
 * @implements TeqFw_Db_Back_Api_RDb_IConnect
 */
export default class TeqFw_Db_Back_RDb_Connect {

    constructor(spec) {
        /** @type {TeqFw_Core_Shared_Logger} */
        const logger = spec['TeqFw_Core_Shared_Logger$'];

        let knex;

        /**
         * Initialize connection to database.
         *
         * @param {TeqFw_Db_Back_Api_Dto_Config_Local|Knex.Config} cfg
         * @returns {Promise<void>}
         */
        this.init = async function (cfg) {
            const db = cfg.connection.database + '@' + cfg.connection.host;
            const user = cfg.connection.user;
            try {
                knex = await $knex(cfg);
                logger.info('Connected to DB \'' + db + '\' as \'' + user + '\'.');
            } catch (e) {
                logger.error('Cannot connect to DB \'' + db + '\' as \'' + user + '\'. Error: ' + e);
            }
        };


        /**
         * Start new knex transaction.
         *
         * @returns {Promise<*>}
         */
        this.startTransaction = async function () {
            return await knex.transaction();
        };

        /**
         * Accessor for 'knex' object.
         *
         * @returns {*}
         */
        this.getKnex = function () {
            return knex;
        };

        /**
         * Accessor for 'knex.schema' object.
         * (empty array is returned for async function)
         * @returns {SchemaBuilder}
         */
        this.getSchemaBuilder = function () {
            return knex.schema;
        };

        this.disconnect = async function () {
            const pool = knex.client.pool;
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
                        knex.destroy();
                        logger.info('All database connections are closed.');
                        resolve();
                    }
                }

                setTimeout(checkPool, WAIT);
            });

        };
    }
}
