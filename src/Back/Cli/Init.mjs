// @ts-check

/**
 * @namespace TeqFw_Db_Back_Cli_Init
 * @description TeqFW database package module.
 */

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
 * @param {object} deps
 * @param {TeqFw_Db_Back_Defaults} deps.DEF
 * @param {TeqFw_Log_Provider} deps.logger
 * @param {TeqFw_Db_Back_Cli_Dto_Command__Factory} deps.fCommand
 * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
 * @param {TeqFw_Db_Back_Config} deps.config
 * @param {TeqFw_Db_Back_Api_RDb_Schema} deps.dbSchema
 * @param {TeqFw_Db_Back_Dem_Load} deps.demLoad
 * @param {TeqFw_Db_Back_App_Shutdown} deps.app
 * @returns {TeqFw_Db_Back_Cli_Dto_Command}
 * @memberOf TeqFw_Db_Back_Cli_Init
 */
export default function Factory({DEF, logger, fCommand, conn, config, dbSchema, demLoad, app}) {
    const log = logger.forSource('TeqFw_Db_Back_Cli_Init');

    // FUNCS
    /**
     * Command action.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Init
     */
    async function action({testDems, testMapRoot} = {}) {
        // load DEMs then drop/create all tables
        const path = config.getPathToRoot();
        const adapter = conn.getDialectAdapter();
        const {compilation} = await demLoad.exec({path, testDems, testMapRoot, adapter});
        dbSchema.setCompilation({compilation});
        await dbSchema.dropAllTables({conn});
        await dbSchema.createAllTables({conn});
        log.info('Database structure is recreated.');
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

export const __deps__ = Object.freeze({
    default: Object.freeze({
            DEF: 'TeqFw_Db_Back_Defaults$',
            logger: 'TeqFw_Log_Provider$',
            fCommand: 'TeqFw_Db_Back_Cli_Dto_Command__Factory$',
            conn: 'TeqFw_Db_Back_RDb_Connect$',
            config: 'TeqFw_Db_Back_Config$',
            dbSchema: 'TeqFw_Db_Back_RDb_Schema$',
            demLoad: 'TeqFw_Db_Back_Dem_Load$',
            app: 'TeqFw_Db_Back_App_Shutdown$',
    }),
});
