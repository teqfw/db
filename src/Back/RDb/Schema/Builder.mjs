export default class TeqFw_Db_Back_RDb_Schema_Builder {
    /** @type {TeqFw_Db_Back_Api_IConnect} */
    #conn;

    constructor(spec) {
        this.#conn = spec['TeqFw_Db_Back_Api_IConnect$'];
    }

    /**
     * @param {Knex.SchemaBuilder} schema
     * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table} dto
     */
    addTable(schema, dto) {
        schema.createTable(dto.name, (table) => {
            // DEFINE INNER FUNCTIONS
            /**
             * @param {Knex.CreateTableBuilder} table
             * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Column} dto
             */
            function addColumn(table, dto) {
                /** @type {Knex.ColumnBuilder} */
                const column = table[dto.type](dto.name);
                if (dto.comment) column.comment(dto.comment);
                (dto?.nullable) ? column.nullable() : column.notNullable();
                // TODO: add 'default' processing
                if (dto.unsigned === true) column.unsigned();
            }

            /**
             * @param {Knex.CreateTableBuilder} table
             * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index} dto
             */
            function addIndex(table, dto) {
                table[dto.type](dto.columns, dto.name);
            }

            /**
             * @param {Knex.CreateTableBuilder} table
             * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Relation} dto
             */
            function addRelation(table, dto) {
                const chained = table.foreign(dto.ownColumns);
                chained.references(dto.itsColumns).inTable(dto.itsTable);
                if (dto.name) chained.withKeyName(dto.name);
                if (dto.onDelete) chained.onDelete(dto.onDelete);
                if (dto.onUpdate) chained.onUpdate(dto.onUpdate);
                debugger
            }

            // MAIN FUNCTIONALITY
            if (dto.comment) table.comment(dto.comment);
            for (const one of dto.columns) addColumn(table, one);
            for (const one of dto.indexes) addIndex(table, one);
            for (const one of dto.relations) addRelation(table, one);
        });
    }

    /**
     * @param {Knex.SchemaBuilder} schema
     * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table} dto
     */
    dropTable(schema, dto) {
        schema.dropTableIfExists(dto.name);
    }
}
