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

    isPostgres() {
        return this.#trx?.client?.constructor?.name === 'Client_PG';
    }

    isMariaDB() {
        const name = this.#trx?.client?.constructor?.name;
        return (name === 'Client_MySQL2') || (name === 'Client_MySQL');
    }

    async commit() {
        return this.#trx.commit();
    }

    async rollback() {
        return this.#trx.rollback();
    }

    getTableName(meta) {
        return this.#resolver.getTableName(meta);
    }
}
