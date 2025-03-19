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
            // prepare schema (populate with CREATE statements)
            const schema = conn.getSchemaBuilder();
            const knex = conn.getKnex();
            const dem = _dem;
            // sort all tables in the order of dependencies
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem, addDeprecated: false});
            _logger.info(`Total ${entities.length} entities are in DEM.`);
            // convert DEM definition into the knex definition
            /** @type {TeqFw_Db_Back_Dto_RDb_Table[]} */
            const tables = [];
            for (const entity of entities)
                tables.push(await _aConvert.exec({entity, cfg: _cfg}));
            // add tables to the schema
            for (const tbl of tables)
                _builder.addTable(schema, tbl, knex);
            // add relations between entities (foreign keys) to the schema
            for (const tbl of tables)
                _builder.addRelation(schema, tbl, knex);
            // execute all statements
            // const sql = schema.toString();
            await schema;
        };

        this.dropAllTables = async function ({conn}) {
            // TODO: we does not need the ordering if we drop/create tables and foreign keys separately
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem: _dem, addDeprecated: true});
            _logger.info(`Total ${entities.length} entities are in DEM.`);
            entities.reverse(); // reverse order for tables drop
            /** @type {TeqFw_Db_Back_Dto_RDb_Table[]} */
            const tables = [];
            for (const entity of entities)
                tables.push(await _aConvert.exec({entity, cfg: _cfg}));
            // drop all foreign keys
            for (const tbl of tables) {
                const relations = tbl.relations;
                for (const rel of relations) {
                    const schema = conn.getSchemaBuilder();
                    schema.table(tbl.name, (table) => {
                        table.dropForeign(rel.ownColumns, rel.name);
                    });
                    try {
                        await schema;
                        _logger.info(`The '${tbl.name}/${rel.name}' relation is dropped.`);
                    } catch (e) {
                        _logger.error(`Cannot drop the '${tbl.name}/${rel.name}' relation.`);
                    }
                }
            }
            // drop all tables
            const schema = conn.getSchemaBuilder();
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                _builder.dropTable(schema, tbl);
                _logger.info(`Table '${tbl.name}' is dropped.`);
            }
            // execute statements and drop all tables
            await schema;
        };

        this.fetchTablesByDependencyOrder = async function () {
            const res = [];
            /** @type {TeqFw_Db_Back_Dto_Dem_Entity[]} */
            const entities = await _aOrder.exec({dem: _dem});
            for (const entity of entities) {
                const tbl = await _aConvert.exec({entity, cfg: _cfg});
                res.push(tbl);
            }
            return res;
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
