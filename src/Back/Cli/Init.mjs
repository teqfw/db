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
 * @param {TeqFw_Di_Shared_SpecProxy} spec
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Db_Back_Cli_Init
 */
export default function Factory(spec) {
    // DEPS
    /** @type {TeqFw_Db_Back_Defaults} */
    const DEF = spec['TeqFw_Db_Back_Defaults$'];
    /** @type {TeqFw_Core_Shared_Api_Logger} */
    const logger = spec['TeqFw_Core_Shared_Api_Logger$$']; // instance
    /** @type {TeqFw_Core_Back_Api_Dto_Command.Factory} */
    const fCommand = spec['TeqFw_Core_Back_Api_Dto_Command#Factory$'];
    /** @type {TeqFw_Db_Back_RDb_IConnect} */
    const conn = spec['TeqFw_Db_Back_RDb_IConnect$'];
    /** @type {TeqFw_Core_Back_Config} */
    const config = spec['TeqFw_Core_Back_Config$'];
    /** @type {TeqFw_Db_Back_Api_RDb_ISchema} */
    const dbSchema = spec['TeqFw_Db_Back_Api_RDb_ISchema$'];
    /** @type {TeqFw_Db_Back_Dem_Load} */
    const demLoad = spec['TeqFw_Db_Back_Dem_Load$'];
    /** @type {TeqFw_Core_Back_App} */
    const app = spec['TeqFw_Core_Back_App$'];

    // VARS
    logger.setNamespace(NS);

    // FUNCS
    /**
     * Command action.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Init
     */
    async function action() {
        // load DEMs then drop/create all tables
        const path = config.getBoot().projectRoot;
        const {dem, cfg} = await demLoad.exec({path});
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
    res.desc = '(Re)create RDB structure.';
    res.action = action;
    return res;
}
