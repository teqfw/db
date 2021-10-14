/**
 * Default implementation for schema builder using DEM.
 *
 * @implements TeqFw_Db_Back_RDb_ISchema
 */
export default class TeqFw_Db_Back_RDb_Schema {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Db_Back_RDb_Schema_A_Convert} */
        const $aConvert = spec['TeqFw_Db_Back_RDb_Schema_A_Convert$'];
        /** @type {TeqFw_Db_Back_Dem_Norm} */
        const $aNorm = spec['TeqFw_Db_Back_Dem_Norm$'];
        /** @type {TeqFw_Db_Back_RDb_Schema_A_Order} */
        const $aOrder = spec['TeqFw_Db_Back_RDb_Schema_A_Order$'];
        /** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
        const $builder = spec['TeqFw_Db_Back_RDb_Schema_A_Builder$'];
        /** @type {TeqFw_Db_Back_Dem_Load_Map} */
        const $mapLoad = spec['TeqFw_Db_Back_Dem_Load_Map$'];
        /** @type {TeqFw_Db_Back_Dem_Scanner} */
        const $schemaLoad = spec['TeqFw_Db_Back_Dem_Scanner$'];

        // DEFINE WORKING VARS / PROPS
        /** @type {TeqFw_Db_Back_Dto_Dem} */
        let $dem;

        // DEFINE INSTANCE METHODS
        this.createAllTables = async function ({conn}) {
            // prepare schema (populate with CREATE TABLE statements)
            const schema = conn.getSchemaBuilder();
            const knex = conn.getKnex();
            const dem = $dem;
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await $aOrder.exec({dem});
            for (const entity of entities) {
                const tbl = await $aConvert.exec({entity});
                $builder.addTable(schema, tbl, knex);
            }
            // perform operations
            // const sql = schema.toString();
            await schema;
        }

        this.dropAllTables = async function ({conn}) {
            // prepare schema (populate with DROP statements)
            const schema = conn.getSchemaBuilder();
            const dem = $dem;
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await $aOrder.exec({dem});
            entities.reverse(); // reverse order for tables drop
            for (const entity of entities) {
                const tbl = await $aConvert.exec({entity});
                $builder.dropTable(schema, tbl);
            }
            // perform operations
            await schema;
        }

        this.loadDem = async function ({path}) {
            // load DEM fragments and external references mapping rules
            /** @type {Object<string, TeqFw_Db_Back_Dto_Dem>} */
            const dems = await $schemaLoad.exec({path});
            /** @type {Object<string, Object<string, TeqFw_Db_Back_Dto_Map_Ref>>} */
            const map = await $mapLoad.exec({path});
            // process all DEMs and map virtual aliases to real paths
            $dem = await $aNorm.exec({dems, map});
        }

        this.setDem = function ({dem}) {
            $dem = dem;
        }
    }

}
