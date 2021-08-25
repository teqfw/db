/**
 * @implements TeqFw_Db_Back_Api_RDb_ISchema
 */
export default class TeqFw_Db_Back_RDb_Schema {
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Norm} */
    #aNorm;
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Order} */
    #aOrder;
    /** @type {TeqFw_Db_Back_RDb_Schema_A_Scan} */
    #aScan;
    /** @type {TeqFw_Db_Back_RDb_Schema_Builder} */
    #builder;
    /** @type {TeqFw_Db_Back_Dto_Dem} */
    #dem;

    constructor(spec) {
        // EXTRACT DEPS
        this.#aNorm = spec['TeqFw_Db_Back_RDb_Schema_A_Norm$'];
        this.#aOrder = spec['TeqFw_Db_Back_RDb_Schema_A_Order$'];
        this.#aScan = spec['TeqFw_Db_Back_RDb_Schema_A_Scan$'];
        this.#builder = spec['TeqFw_Db_Back_RDb_Schema_Builder$'];
    }


    async createAllTables({conn}) {
        return Promise.resolve(undefined);
    }

    async dropAllTables({conn}) {
        const schema = conn.getSchemaBuilder();
        const dem = this.#dem;
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
        const entities = await this.#aOrder.exec({dem});
        entities.reverse(); // reverse order for tables drop
        for(const one of entities) {
            this.#builder.dropTable(schema, one);
        }
        return Promise.resolve(undefined);
    }

    /**
     *
     * @param {string} path to project root to scan for DEM definitions.
     * @return {Promise<unknown>}
     */
    async init({path}) {
        const dem = await this.#aScan.exec({path});
        this.#dem = await this.#aNorm.exec({dem});
    }
}
