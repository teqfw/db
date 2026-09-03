// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Trans
 * @description TeqFW database package module.
 */

/**
 * Knex based implementation for single transaction to manipulate data in DB.
 * @implements TeqFw_Db_Back_RDb_ITrans
 */
export default class TeqFw_Db_Back_RDb_Trans {
    /** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
    #adapter;
    /** @type {TeqFw_Db_Back_RDb_Connect_Resolver} */
    #resolver;
    /** @type {any} */
    #trx;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.adapter
     * @param {TeqFw_Db_Back_RDb_Connect_Resolver} deps.resolver
     * @param {object} deps.trx
     */
    constructor({adapter, resolver, trx}) {
        this.#adapter = adapter;
        this.#resolver = resolver;
        this.#trx = trx;

        /**
         * Return new knex based query builder.
         * @returns {any}
         */
        this.createQuery = function() {
            return this.#trx.queryBuilder();
        };

        /**
         * @returns {Promise<void>}
         */
        this.disconnect = async function() {};

        /**
         * @returns {any}
         */
        this.isMariaDB = function() {
            const name = this.#trx?.client?.constructor?.name;
            return (name === 'Client_MySQL2') || (name === 'Client_MySQL');
        };

        /**
         * @returns {any}
         */
        this.isPostgres = function() {
            return this.#trx?.client?.constructor?.name === 'Client_PG';
        };

        /**
         * @returns {any}
         */
        this.isSqlite = function() {
            const name = this.#trx?.client?.constructor?.name;
            return (name === 'Client_SQLite3') || (name === 'Client_BetterSQLite3');
        };

        /**
         * @returns {Promise<any>}
         */
        this.commit = async function() {
            return this.#trx.commit();
        };

        /**
         * @returns {Promise<any>}
         */
        this.rollback = async function() {
            return this.#trx.rollback();
        };

        /**
         * @param {any} exp
         * @param {any} params
         * @returns {any}
         */
        this.raw = function(exp, params) {
            return this.#trx.raw(exp, params);
        };

        /**
         * @param {any} meta
         * @returns {any}
         */
        this.getTableName = function(meta) {
            return this.#resolver.getTableName(meta);
        };

        /** @returns {TeqFw_Db_Back_Api_RDb_Dialect} */
        this.getDialectAdapter = function() {
            return this.#adapter;
        };

        /** @returns {any} */
        this.getKnexTrx = function() {
            return this.#trx;
        };
    }
}
