/**
 * Default implementation for schema builder using DEM.
 *
 * @implements TeqFw_Db_Back_Api_RDb_ISchema
 */
export default class TeqFw_Db_Back_RDb_Schema {
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Convert} */
    #aConvert;
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Norm} */
    #aNorm;
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Order} */
    #aOrder;
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Scan} */
    #aScan;
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
    #builder;
    /** @type {TeqFw_Db_Back_Dto_Dem} */
    #dem;

    constructor(spec) {
        // EXTRACT DEPS
        this.#aConvert = spec['TeqFw_Db_Back_RDb_Schema_A_Convert$'];
        this.#aNorm = spec['TeqFw_Db_Back_RDb_Schema_A_Norm$'];
        this.#aOrder = spec['TeqFw_Db_Back_RDb_Schema_A_Order$'];
        this.#aScan = spec['TeqFw_Db_Back_RDb_Schema_A_Scan$'];
        this.#builder = spec['TeqFw_Db_Back_RDb_Schema_A_Builder$'];
    }


    async createAllTables({conn}) {
        // prepare schema (populate with CREATE TABLE statements)
        const schema = conn.getSchemaBuilder();
        const dem = this.#dem;
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
        const entities = await this.#aOrder.exec({dem});
        for (const entity of entities) {
            const tbl = await this.#aConvert.exec({entity});
            this.#builder.addTable(schema, tbl);
        }
        // perform operations
        // const sql = schema.toString();
        await schema;
    }

    async dropAllTables({conn}) {
        // prepare schema (populate with DROP statements)
        const schema = conn.getSchemaBuilder();
        const dem = this.#dem;
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
        const entities = await this.#aOrder.exec({dem});
        entities.reverse(); // reverse order for tables drop
        for (const entity of entities) {
            const tbl = await this.#aConvert.exec({entity});
            this.#builder.dropTable(schema, tbl);
        }
        // perform operations
        await schema;
    }

    async loadDem({path}) {
        const dem = await this.#aScan.exec({path});
        this.#dem = await this.#aNorm.exec({dem});
    }
}
