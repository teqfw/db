/**
 * Knex based implementation for single transaction to manipulate data in DB.
 * @implements TeqFw_Db_Back_RDb_ITrans
 */
export default class TeqFw_Db_Back_RDb_Trans {
    /** @type {TeqFw_Db_Back_RDb_Connect_Resolver} */
    #resolver;
    /** @type {Knex} */
    #trx;

    /**
     * @param {TeqFw_Db_Back_RDb_Connect_Resolver} resolver
     * @param {Knex} trx
     */
    constructor({resolver, trx}) {
        this.#resolver = resolver;
        this.#trx = trx;
    }

    /**
     * Return new knex based query builder.
     * @return {Knex.QueryBuilder}
     */
    createQuery() {
        return this.#trx.queryBuilder();
    }

    async disconnect() {}

    isMariaDB() {
        const name = this.#trx?.client?.constructor?.name;
        return (name === 'Client_MySQL2') || (name === 'Client_MySQL');
    }

    isPostgres() {
        return this.#trx?.client?.constructor?.name === 'Client_PG';
    }

    isSqlite() {
        return this.#trx?.client?.constructor?.name === 'Client_SQLite3';
    }

    async commit() {
        return this.#trx.commit();
    }

    async rollback() {
        return this.#trx.rollback();
    }

    raw(exp, params) {
        return this.#trx.raw(exp, params);
    }

    getTableName(meta) {
        return this.#resolver.getTableName(meta);
    }

    getQuery(table) {
        return this.#trx(table);
    }

    getKnexTrx() {
        return this.#trx;
    }
}
