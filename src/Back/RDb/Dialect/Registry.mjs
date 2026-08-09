// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Registry
 * @description Frozen explicit registry selecting a dialect adapter from a configured Knex client.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Registry {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.mysql
     * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.postgresql
     * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.sqlite
     */
    constructor({mysql, postgresql, sqlite}) {
        const adapters = Object.freeze({mysql, postgresql, sqlite});
        const clients = Object.freeze({
            'better-sqlite3': 'sqlite',
            mariadb: 'mysql',
            mysql: 'mysql',
            mysql2: 'mysql',
            pg: 'postgresql',
            'pg-native': 'postgresql',
            postgres: 'postgresql',
            postgresql: 'postgresql',
            sqlite3: 'sqlite',
        });

        /**
         * @param {object} deps
         * @param {string} deps.client
         * @returns {TeqFw_Db_Back_Api_RDb_Dialect}
         */
        this.select = function ({client}) {
            const id = clients[client];
            if (!id) throw new TypeError(`No @teqfw/db dialect adapter is registered for Knex client '${client}'.`);
            return adapters[id];
        };
        /** @param {object} deps @param {string} deps.id @returns {TeqFw_Db_Back_Api_RDb_Dialect} */
        this.getById = function ({id}) {
            const adapter = adapters[id];
            if (!adapter) throw new TypeError("No @teqfw/db dialect adapter is registered for id '" + id + "'.");
            return adapter;
        };
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        mysql: 'TeqFw_Db_Back_RDb_Dialect_Mysql$',
        postgresql: 'TeqFw_Db_Back_RDb_Dialect_Postgresql$',
        sqlite: 'TeqFw_Db_Back_RDb_Dialect_Sqlite$',
    }),
});
