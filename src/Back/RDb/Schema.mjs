/**
 * Default implementation for schema builder using DEM.
 *
 * @implements TeqFw_Db_Back_Api_RDb_Schema
 */
export default class TeqFw_Db_Back_RDb_Schema {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} _logger
     * @param {TeqFw_Db_Back_RDb_Schema_A_Convert} _aConvert
     * @param {TeqFw_Db_Back_RDb_Schema_A_Order} _aOrder
     * @param {TeqFw_Db_Back_RDb_Schema_A_Builder} _builder
     */

    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$: _logger,
            TeqFw_Db_Back_RDb_Schema_A_Convert$: _aConvert,
            TeqFw_Db_Back_RDb_Schema_A_Order$: _aOrder,
            TeqFw_Db_Back_RDb_Schema_A_Builder$: _builder,
        }) {
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
            const entities = await _aOrder.exec({dem, addDeprecated: false});
            _logger.info(`Total ${entities.length} entities are in DEM.`);
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                _builder.addTable(schema, tbl, knex);
                _logger.info(`Table '${tbl.name}' is created.`);
            }
            // perform operations
            // const sql = schema.toString();
            await schema;
        };

        this.dropAllTables = async function ({conn}) {
            // prepare schema (populate with DROP statements)
            const schema = conn.getSchemaBuilder();
            const dem = _dem;
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem, addDeprecated: true});
            _logger.info(`Total ${entities.length} entities are in DEM.`);
            entities.reverse(); // reverse order for tables drop
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                _builder.dropTable(schema, tbl);
                _logger.info(`Table '${tbl.name}' is dropped.`);
            }
            // perform operations
            await schema;
        };

        this.getTablesList = async function () {
            const res = [];
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem: _dem});
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                res.push(tbl.name);
            }
            return res;
        };

        this.setCfg = function ({cfg}) {
            _cfg = cfg;
        };
        this.setDem = function ({dem}) {
            _dem = dem;
        };
    }


}
