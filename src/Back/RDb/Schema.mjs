// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema
 * @description TeqFW database package module.
 */

/**
 * Default implementation for schema builder using DEM.
 *
 * @implements TeqFw_Db_Back_Api_RDb_Schema
 */
export default class TeqFw_Db_Back_RDb_Schema {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Logger} deps._logger
     * @param {TeqFw_Db_Back_RDb_Schema_A_Convert} deps._aConvert
     * @param {TeqFw_Db_Back_RDb_Schema_A_Order} deps._aOrder
     * @param {TeqFw_Db_Back_RDb_Schema_A_Builder} deps._builder
     */

    constructor({_logger, _aConvert, _aOrder, _builder}) {
        // VARS
        /** @type {TeqFw_Db_Back_Dto_Dem} */
        let _dem;
        /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
        let _cfg;

        // INSTANCE METHODS
        /**
         * @param {object} deps
         * @param {any} deps.conn
         * @returns {Promise<void>}
         */
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

        /**
         * @param {object} deps
         * @param {any} deps.conn
         * @returns {Promise<void>}
         */
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

        /**
         * @returns {Promise<any>}
         */
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

        /**
         * @returns {Promise<any>}
         */
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

        /**
         * @param {object} deps
         * @param {any} deps.cfg
         */
        this.setCfg = function ({cfg}) {
            _cfg = cfg;
        };
        /**
         * @param {object} deps
         * @param {any} deps.dem
         */
        this.setDem = function ({dem}) {
            _dem = dem;
        };
    }


}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            _logger: 'TeqFw_Db_Back_Logger$',
            _aConvert: 'TeqFw_Db_Back_RDb_Schema_A_Convert$',
            _aOrder: 'TeqFw_Db_Back_RDb_Schema_A_Order$',
            _builder: 'TeqFw_Db_Back_RDb_Schema_A_Builder$',
    }),
});
