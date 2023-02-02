/**
 * Default implementation for schema builder using DEM.
 *
 * @implements TeqFw_Db_Back_Api_RDb_ISchema
 */
export default class TeqFw_Db_Back_RDb_Schema {

    constructor(spec) {
        // DEPS
        /** @type {TeqFw_Core_Shared_Api_Logger} */
        const _logger = spec['TeqFw_Core_Shared_Api_Logger$'];
        /** @type {TeqFw_Db_Back_RDb_Schema_A_Convert} */
        const _aConvert = spec['TeqFw_Db_Back_RDb_Schema_A_Convert$'];
        /** @type {TeqFw_Db_Back_RDb_Schema_A_Order} */
        const _aOrder = spec['TeqFw_Db_Back_RDb_Schema_A_Order$'];
        /** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
        const _builder = spec['TeqFw_Db_Back_RDb_Schema_A_Builder$'];

        // VARS
        /** @type {TeqFw_Db_Back_Dto_Dem} */
        let _dem;
        /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
        let _cfg;

        // INSTANCE METHODS
        this.createAllTables = async function ({conn}) {
            // prepare schema (populate with CREATE TABLE statements)
            const schema = conn.getSchemaBuilder();
            const knex = conn.getKnex();
            const dem = _dem;
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem});
            _logger.info(`Total ${entities.length} entities are in DEM.`);
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                _builder.addTable(schema, tbl, knex);
                _logger.info(`Table '${tbl.name}' is created.`);
            }
            // perform operations
            // const sql = schema.toString();
            await schema;
        }

        this.dropAllTables = async function ({conn}) {
            // prepare schema (populate with DROP statements)
            const schema = conn.getSchemaBuilder();
            const dem = _dem;
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem});
            entities.reverse(); // reverse order for tables drop
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                _builder.dropTable(schema, tbl);
            }
            // perform operations
            await schema;
        }

        this.getTablesList = async function () {
            const res = [];
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem: _dem});
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                res.push(tbl.name);
            }
            return res;
        }

        this.setCfg = function ({cfg}) {
            _cfg = cfg;
        }
        this.setDem = function ({dem}) {
            _dem = dem;
        }
    }


}
