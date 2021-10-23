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
     * Convert entity name to table name ('@vnd/plugin/package/entity' => 'prefix_package_entity').
     * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @return {string}
     */
    getTableName(meta) {}

    /**
     * 'true' if type of connected RDBMS is MariaDB or MySQL.
     * @return {boolean}
     */
    isMariaDB() {}

    /**
     * 'true' if type of connected RDBMS is PostgreSQL
     * @return {boolean}
     */
    isPostgres() {}

    async rollback() {}


    /**
     * TODO: remove it
     * @param {string|Object} table
     * @return {Knex.Builder}
     * @deprecated temporary solution for refactoring period
     */
    getQuery(table) { }

    /**
     * TODO: remove it
     * @return {Knex}
     * @deprecated temporary solution for refactoring period
     */
    getTrx() { }
}
