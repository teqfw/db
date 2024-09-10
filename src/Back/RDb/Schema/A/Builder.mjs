export default class TeqFw_Db_Back_RDb_Schema_A_Builder {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Column} TDbColType
     */
    constructor(
        {
            TeqFw_Core_Shared_Logger$$: logger, // inject the implementation
            TeqFw_Db_Back_Enum_Db_Type_Column$: TDbColType,
        }
    ) {
        // INSTANCE METHODS

        /**
         * @param {Knex.SchemaBuilder} schema
         * @param {TeqFw_Db_Back_Dto_RDb_Table} dto
         * @param {*} knex
         */
        this.addRelation = function (schema, dto, knex) {
            schema.table(dto.name, (table) => {
                // FUNCS
                /**
                 * @param {Knex.CreateTableBuilder} table
                 * @param {TeqFw_Db_Back_Dto_RDb_Relation} dto
                 */
                function addRelation(table, dto) {
                    const chained = table.foreign(dto.ownColumns);
                    chained.references(dto.itsColumns).inTable(dto.itsTable);
                    if (dto.name) chained.withKeyName(dto.name);
                    if (dto.onDelete) chained.onDelete(dto.onDelete);
                    if (dto.onUpdate) chained.onUpdate(dto.onUpdate);
                }

                // MAIN
                for (const one of dto.relations) addRelation(table, one);
                logger.info(`The relations for table '${dto.name}' are added.`);
            });
        };

        /**
         * @param {Knex.SchemaBuilder} schema
         * @param {TeqFw_Db_Back_Dto_RDb_Table} dto
         * @param {*} knex
         */
        this.addTable = function (schema, dto, knex) {
            schema.createTable(dto.name, (table) => {
                // FUNCS
                /**
                 * @param {Knex.CreateTableBuilder} table
                 * @param {TeqFw_Db_Back_Dto_RDb_Column} dto
                 */
                function addColumn(table, dto) {
                    /** @type {Knex.ColumnBuilder} */
                    let column;
                    if (dto.type === TDbColType.ENUM) {
                        column = table[dto.type](dto.name, dto.enum);
                    } else if (dto.type === TDbColType.DECIMAL) {
                        column = table[dto.type](dto.name, dto.precision, dto.scale);
                    } else if (dto.type === TDbColType.BINARY) {
                        column = table[dto.type](dto.name, dto?.length);
                    } else {
                        column = table[dto.type](dto.name);
                    }
                    if (dto.comment) column.comment(dto.comment);
                    (dto?.nullable) ? column.nullable() : column.notNullable();
                    if (dto.default !== undefined) {
                        if (
                            (dto.type === TDbColType.DATE) || (dto.type === TDbColType.DATETIME)
                            && (dto.default === 'current')
                        ) {
                            column.defaultTo(knex.fn.now());
                        } else {
                            column.defaultTo(dto.default);
                        }
                    }
                    if (dto.unsigned === true) column.unsigned();
                }

                /**
                 * @param {Knex.CreateTableBuilder} table
                 * @param {TeqFw_Db_Back_Dto_RDb_Index} dto
                 */
                function addIndex(table, dto) {
                    table[dto.type](dto.columns, dto.name);
                }

                // MAIN
                if (dto.comment) table.comment(dto.comment);
                for (const one of dto.columns) addColumn(table, one);
                for (const one of dto.indexes) addIndex(table, one);
                logger.info(`The table '${dto.name}' is added.`);
            });
        };

        /**
         * @param {Knex.SchemaBuilder} schema
         * @param {TeqFw_Db_Back_Dto_RDb_Table} dto
         */
        this.dropRelations = function (schema, dto) {
            schema.table(dto.name, (table) => {
                for (const one of dto.relations) {
                    table.dropForeign(one.ownColumns);
                }
            });

        };

        /**
         * @param {Knex.SchemaBuilder} schema
         * @param {TeqFw_Db_Back_Dto_RDb_Table} dto
         */
        this.dropTable = function (schema, dto) {
            schema.dropTableIfExists(dto.name);
        };
    }


}
