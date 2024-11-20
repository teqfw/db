/**
 * (Re)create RDB structure.
 *
 * @namespace TeqFw_Db_Back_Cli_Init
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Cli_Init';

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
 * @memberOf TeqFw_Db_Back_Cli_Init
 */
export default function Factory(
    {
        TeqFw_Db_Back_Defaults$: DEF,
        TeqFw_Core_Shared_Api_Logger$$: logger,
        'TeqFw_Core_Back_Api_Dto_Command.Factory$': fCommand,
        TeqFw_Db_Back_RDb_IConnect$: conn,
        TeqFw_Core_Back_Config$: config,
        TeqFw_Db_Back_Api_RDb_Schema$: dbSchema,
        TeqFw_Db_Back_Dem_Load$: demLoad,
        TeqFw_Core_Back_App$: app,
    }) {

    // FUNCS
    /**
     * Command action.
     * @param {Object<string, string>} testDems
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Init
     */
    async function action({testDems} = {}) {
        // load DEMs then drop/create all tables
        const path = config.getPathToRoot();
        const {dem, cfg} = await demLoad.exec({path, testDems});
        await dbSchema.setDem({dem});
        await dbSchema.setCfg({cfg});
        await dbSchema.dropAllTables({conn});
        await dbSchema.createAllTables({conn});
        logger.info('Database structure is recreated.');
        await app.stop();
    }

    Object.defineProperty(action, 'namespace', {value: NS});

    // MAIN
    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'init';
    res.desc = '(re)create RDB structure';
    res.action = action;
    return res;
}
