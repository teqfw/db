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

    /**
     * 'true' if type of connected RDBMS is SQLite
     * @return {boolean}
     */
    isSqlite() {}

    /**
     * Return row expression for input data.
     * @param {string} exp SQL expression
     * @param {array} params parameters for SQL exp (knex.raw('status <> ?', [1]))
     */
    raw(exp, params) {}

    async rollback() {}

    /**
     * TODO: remove it
     * @param {string|Object} table
     * @return {Knex.Builder}
     * @deprecated temporary solution for refactoring period
     */
    getQuery(table) { }

    /**
     * 'Knex' object
     * @return {Knex}
     */
    getKnexTrx() { }
}
