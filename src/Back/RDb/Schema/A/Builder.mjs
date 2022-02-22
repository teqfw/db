export default class TeqFw_Db_Back_RDb_Schema_A_Builder {

    constructor(spec) {
        // DEPS
        /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Column} */
        const TDbColType = spec['TeqFw_Db_Back_Enum_Db_Type_Column$'];

        // DEFINE INSTANCE METHODS
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
                    const column = (dto.type === TDbColType.ENUM)
                        ? table[dto.type](dto.name, dto.enum)
                        : (dto.type === TDbColType.DECIMAL)
                            ? table[dto.type](dto.name, dto.precision, dto.scale)
                            : table[dto.type](dto.name);
                    if (dto.comment) column.comment(dto.comment);
                    (dto?.nullable) ? column.nullable() : column.notNullable();
                    if (dto.default !== undefined) {
                        if (
                            (dto.type === TDbColType.DATE) || (dto.type === TDbColType.DATETIME)
                            && (dto.default === 'current')
                        ) {
                            column.defaultTo(knex.fn.now());
                        } else {
                            column.defaultTo(dto.default)
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
                if (dto.comment) table.comment(dto.comment);
                for (const one of dto.columns) addColumn(table, one);
                for (const one of dto.indexes) addIndex(table, one);
                for (const one of dto.relations) addRelation(table, one);
            });
        }

        /**
         * @param {Knex.SchemaBuilder} schema
         * @param {TeqFw_Db_Back_Dto_RDb_Table} dto
         */
        this.dropTable = function (schema, dto) {
            schema.dropTableIfExists(dto.name);
        }
    }


}
