/**
 * Class providing CRUD operations for database entities in TeqFW.
 * Methods support creating, reading, updating, and deleting records
 * with transactional consistency and schema validation.
 *
 * This class uses Knex.js to interact with the database and ensures transactional consistency
 * by automatically starting, committing, or rolling back transactions where necessary.
 */
export default class TeqFw_Db_Back_App_Crud {
    /**
     * @param {TeqFw_Db_Back_RDb_IConnect} conn - Default database connection.
     */
    constructor(
        {
            TeqFw_Db_Back_RDb_IConnect$: conn,
        }
    ) {
        // FUNCS

        /**
         * Validates and filters attributes based on schema.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema - Schema object to validate attributes.
         * @param {Object<string, *>} values - Input values to be filtered.
         * @return {Object<string, *>} - Filtered attributes.
         */
        function filterAttributes(schema, values) {
            const res = {};
            const attrs = Object.values(schema.getAttributes());
            const keyParts = Array.isArray(values) ? Object.fromEntries(values) : values;

            for (const [attr, value] of Object.entries(keyParts)) {
                if (!attrs.includes(attr)) {
                    throw new Error(`Attribute "${attr}" is not defined in the schema.`);
                }
                res[attr] = value;
            }
            return res;
        }

        /**
         * Populates a WHERE clause for a Knex query based on the key.
         * @param {Knex.QueryBuilder} query - query object to populate.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema - Schema object.
         * @param {string|number|boolean|Buffer|Object|Array} key - Primary key or composite key object.
         * @returns {Object} - WHERE clause with attribute-value pairs.
         * @throws {Error} - If the key is invalid or mismatches the schema.
         */
        function composeWhere(query, schema, key) {
            const parts = {};

            if (
                typeof key === 'number' ||
                typeof key === 'string' ||
                typeof key === 'boolean' ||
                key instanceof Buffer
            ) {
                // Simple key
                const [pk] = schema.getPrimaryKey();
                if (!pk) {
                    throw new Error('Schema does not define a primary key.');
                }
                parts[pk] = key;
            } else if (typeof key === 'object' && key !== null) {
                // Composite key
                const filtered = filterAttributes(schema, key);
                Object.assign(parts, filtered);
            } else {
                throw new Error('Invalid key type. Expected a primitive value or an object.');
            }

            Object.entries(parts).forEach(([key, value]) => {
                if (value === null) {
                    query.whereNull(key);
                } else {
                    query.where(key, value);
                }
            });
        }

        /**
         * Executes a database operation within a transaction.
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx] - Optional transaction object.
         * @param {Function} operation - Operation to execute.
         * @returns {Promise<*>} - Result of the operation.
         * @throws {Error} - If the operation fails.
         */
        async function execute(trx, operation) {
            const activeTrx = trx ?? await conn.startTransaction();
            try {
                const result = await operation(activeTrx);
                if (!trx) await activeTrx.commit();
                return result;
            } catch (error) {
                if (!trx) await activeTrx.rollback();
                throw error;
            }
        }

        // MAIN
        /**
         * Creates a new record in the database.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, string|number>} dto
         * @returns {Promise<{primaryKey: Object<string, string|number>}>}
         * @throws {Error}
         */
        this.createOne = async function ({schema, trx, dto}) {
            if (!schema) throw new Error('Schema is required.');
            if (!dto) throw new Error('DTO is required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @returns {Promise<{primaryKey: Object<string, string|number>}>}
             */
            const operation = async (activeTrx) => {
                const primaryKey = {};
                const table = activeTrx.getTableName(schema);

                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery();
                query.table(table);
                const record = schema.createDto(dto);
                query.insert(record);

                if (activeTrx.isPostgres() || activeTrx.isSqlite()) {
                    query.returning(schema.getPrimaryKey());
                }

                const rs = await query;

                // Process the query result
                if (Array.isArray(rs) && rs.length > 0) {
                    if (typeof rs[0] === 'object') {
                        // For Postgres and SQLite, result is an array of objects
                        Object.assign(primaryKey, rs[0]);
                    } else {
                        // For MariaDB and SQLite, result is an array of primitives
                        const pk = schema.getPrimaryKey();
                        if (pk.length === 1) {
                            primaryKey[pk[0]] = rs[0];
                        } else if (dto) {
                            // For composite primary keys, use values from the DTO
                            pk.forEach((key) => {
                                primaryKey[key] = dto[key];
                            });
                        }
                    }
                } else if (typeof rs === 'number' || typeof rs === 'string') {
                    // For SQLite, result can be a single primitive value
                    const pk = schema.getPrimaryKey();
                    if (pk.length === 1) {
                        primaryKey[pk[0]] = rs;
                    } else {
                        throw new Error('Unexpected result format for a composite primary key.');
                    }
                } else {
                    throw new Error('Unexpected query result format.');
                }
                if (Object.keys(primaryKey).length === 0) {
                    throw new Error('Primary key was not generated. Check the schema and DTO.');
                }
                return {primaryKey};
            };
            return execute(trx, operation);
        };

        /**
         * Deletes a single record based on the provided key.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, *>} key
         * @returns {Promise<{deletedCount: number}>}
         * @throws {Error}
         */
        this.deleteOne = async function ({schema, trx, key}) {
            if (!schema) throw new Error('Schema is required.');
            if (!key) throw new Error('Search key is required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @return {Promise<{deletedCount: number}>}
             */
            const operation = async (activeTrx) => {
                const table = activeTrx.getTableName(schema);
                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery();
                query.table(table);
                // check key values according to allowed attributes and set record filter
                if (Object.keys(key).length <= 0)
                    throw new Error('You want to delete one entity but key is missed. Execution is interrupted.');
                composeWhere(query, schema, key);
                /** @type {number} */
                const deletedCount = await query.del();
                return {deletedCount};
            };

            return execute(trx, operation);
        };

        /**
         * Deletes multiple records matching the provided conditions.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, *>} conditions
         * @returns {Promise<{deletedCount: number}>}
         * @throws {Error}
         */
        this.deleteMany = async function ({schema, trx, conditions}) {
            if (!schema) throw new Error('Schema is required.');
            if (!conditions) throw new Error('Filter conditions are required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @return {Promise<{deletedCount: number}>}
             */
            const operation = async (activeTrx) => {
                const table = activeTrx.getTableName(schema);
                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery();
                query.table(table);
                // check key values according to allowed attributes and set record filter
                composeWhere(query, schema, conditions);
                /** @type {number} */
                const deletedCount = await query.del();
                return {deletedCount};
            };

            return execute(trx, operation);
        };

        /**
         * Reads a single record based on the provided key.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, *>} key
         * @param {Array<string>} [select] - TODO: use select
         * @returns {Promise<{record: Object|null}>}
         * @throws {Error}
         */
        this.readOne = async function ({schema, trx, key, select}) {
            if (!schema) throw new Error('Schema is required.');
            if (!key) throw new Error('Search key is required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @return {Promise<{record: Object|null}>}
             */
            const operation = async (activeTrx) => {
                const table = activeTrx.getTableName(schema);
                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery();
                query.table(table);
                // set record filter
                composeWhere(query, schema, key);
                query.limit(2); // should be one only item, limit if search key is not unique
                const rs = await query;
                const record = Array.isArray(rs) && rs.length > 0 ? schema.createDto(rs[0]) : null;
                return {record};
            };

            return execute(trx, operation);
        };

        /**
         * Reads multiple records based on the provided conditions.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, *>} conditions
         * @param {Object<string, 'asc'|'desc'>} [sorting]
         * @param {{limit: number, offset: number}} [pagination]
         * @returns {Promise<{records: Array<Object>}>}
         * @throws {Error}
         */
        this.readMany = async function ({schema, trx, conditions = {}, sorting, pagination}) {
            if (!schema) throw new Error('Schema is required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @return {Promise<{records: Array<Object>}>}
             */
            const operation = async (activeTrx) => {
                const table = activeTrx.getTableName(schema);
                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery().table(table);

                composeWhere(query, schema, conditions);

                // Apply sorting
                if (sorting) {
                    Object.entries(sorting).forEach(([key, order]) => {
                        if (['asc', 'desc'].includes(order.toLowerCase())) {
                            query.orderBy(key, order);
                        }
                    });
                }

                // Apply pagination
                if (pagination) {
                    const {limit, offset} = pagination;
                    if (typeof limit === 'number' && limit > 0) {
                        query.limit(limit);
                    }
                    if (typeof offset === 'number' && offset >= 0) {
                        query.offset(offset);
                    }
                }

                // Execute the query
                const rs = await query;

                // Convert result rows into DTOs
                const records = Array.isArray(rs) ? rs.map(row => schema.createDto(row)) : [];

                return {records};
            };

            return execute(trx, operation);
        };

        /**
         * Updates a single record matching the provided key.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, *>} key
         * @param {Object<string, *>} updates
         * @returns {Promise<{updatedCount: number}>}
         * @throws {Error}
         */
        this.updateOne = async function ({schema, trx, key, updates}) {
            if (!schema) throw new Error('Schema is required.');
            if (!key) throw new Error('Search key is required.');
            if (!updates) throw new Error('Updates data is required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @return {Promise<{updatedCount: number}>}
             */
            const operation = async (activeTrx) => {
                let updatedCount = 0;
                const table = activeTrx.getTableName(schema);
                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery();
                query.table(table);
                // check key values according to allowed attributes and set record filter
                if (Object.keys(key).length <= 0)
                    throw new Error('You want to update one entity but key is missed. Execution is interrupted.');
                composeWhere(query, schema, key);
                const filtered = filterAttributes(schema, updates);
                updatedCount = await query.update(filtered);
                return {updatedCount};
            };

            return execute(trx, operation);
        };

        /**
         * Updates multiple records matching the provided conditions.
         * @param {TeqFw_Db_Back_Api_RDb_Schema_Object} schema
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object<string, *>} conditions
         * @param {Object<string, *>} updates
         * @returns {Promise<{updatedCount: number}>}
         * @throws {Error}
         */
        this.updateMany = async function ({schema, trx, conditions, updates}) {
            if (!schema) throw new Error('Schema is required.');
            if (!updates) throw new Error('Updates data is required.');

            /**
             * @param {TeqFw_Db_Back_RDb_ITrans} activeTrx
             * @return {Promise<{updatedCount: number}>}
             */
            const operation = async (activeTrx) => {
                const table = activeTrx.getTableName(schema);
                /** @type {Knex.QueryBuilder} */
                const query = activeTrx.createQuery();
                query.table(table);
                // check key values according to allowed attributes and set record filter
                composeWhere(query, schema, conditions);
                const filtered = filterAttributes(schema, updates);
                const updatedCount = await query.update(filtered);
                return {updatedCount};
            };

            return execute(trx, operation);
        };
    }
}
