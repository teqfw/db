// @ts-check

/**
 * @namespace TeqFw_Db_Back_Cli_Drop
 * @description TeqFW database package module.
 */

/**
 * Drop all tables in RDB.
 *
 * @namespace TeqFw_Db_Back_Cli_Drop
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Cli_Drop';

// MODULE'S FUNCTIONS
/**
 * Factory to create CLI command.
 *
 * @param {TeqFw_Db_Back_Defaults} DEF
 * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
 * @param {TeqFw_Core_Back_Api_Dto_Command.Factory} fCommand
 * @param {TeqFw_Db_Back_RDb_IConnect} conn
 * @param {TeqFw_Core_Back_Config} config
 * @param {TeqFw_Db_Back_Api_RDb_Schema} dbSchema
 * @param {TeqFw_Db_Back_Dem_Load} demLoad
 * @param {TeqFw_Core_Back_App} app
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Db_Back_Cli_Drop
 */
export default function Factory({DEF, logger, fCommand, conn, config, dbSchema, demLoad, app}) {

    // FUNCS
    /**
     * Command action.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Drop
     */
    async function action() {
        // load DEMs then drop/create all tables
        const path = config.getPathToRoot();
        const {dem, cfg} = await demLoad.exec({path});
        await dbSchema.setDem({dem});
        await dbSchema.setCfg({cfg});
        await dbSchema.dropAllTables({conn});
        logger.info('All tables are dropped.');
        await app.stop();
    }

    Object.defineProperty(action, 'namespace', {value: NS});

    // MAIN
    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'drop';
    res.desc = 'drop all tables in RDB';
    res.action = action;
    return res;
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            DEF: 'TeqFw_Db_Back_Defaults$',
            logger: 'TeqFw_Db_Back_Logger$',
            fCommand: 'TeqFw_Db_Back_Cli_Dto_Command__Factory$',
            conn: 'TeqFw_Db_Back_RDb_Connect$',
            config: 'TeqFw_Db_Back_Config$',
            dbSchema: 'TeqFw_Db_Back_RDb_Schema$',
            demLoad: 'TeqFw_Db_Back_Dem_Load$',
            app: 'TeqFw_Db_Back_App_Shutdown$',
    }),
});
