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
 * @param {TeqFw_Di_Shared_SpecProxy} spec
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Db_Back_Cli_Drop
 */
/**
 * @param {TeqFw_Db_Back_Defaults} DEF
 * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
 * @param {TeqFw_Core_Back_Api_Dto_Command.Factory} fCommand
 * @param {TeqFw_Db_Back_RDb_IConnect} conn
 * @param {TeqFw_Core_Back_Config} config
 * @param {TeqFw_Db_Back_Api_RDb_Schema} dbSchema
 * @param {TeqFw_Db_Back_Dem_Load} demLoad
 * @param {TeqFw_Core_Back_App} app
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
    // VARS
    logger.setNamespace(NS);

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
