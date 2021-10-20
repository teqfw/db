/**
 * Knex based implementation for single transaction to manipulate data in DB.
 * @implements TeqFw_Db_Back_RDb_ITrans
 */
export default class TeqFw_Db_Back_RDb_Trans {
    /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
    #cfg;
    /** @type {Knex} */
    #trx;

    constructor({cfg, trx}) {
        this.#cfg = cfg;
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

    getSchemaConfig() {
        return this.#cfg;
    }

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
}
