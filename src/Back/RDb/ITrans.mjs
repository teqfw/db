/**
 * Interface for single transaction to manipulate data in DB.
 * Connection creates transaction.
 * @interface
 */
export default class TeqFw_Db_Back_RDb_ITrans {
    async commit() {}

    /**
     * Return knex based query builder.
     * @return {Knex.QueryBuilder}
     */
    createQuery() {}

    async disconnect() {}

    /**
     * Return schema configuration for current connection (table prefix, etc.)
     * @return {TeqFw_Db_Back_Dto_Config_Schema}
     */
    getSchemaConfig() {}

    /**
     * 'true' if type of connected RDBMS is PostgreSQL
     * @return {boolean}
     */
    isPostgres() {}

    async rollback() {}
}
