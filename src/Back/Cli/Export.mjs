// @ts-check

/**
 * @namespace TeqFw_Db_Back_Cli_Export
 * @description TeqFW database package module.
 */

/**
 * Export all data from the RDB into a JSON file.
 *
 * @namespace TeqFw_Db_Back_Cli_Export
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Cli_Export';
const OPT_FILE = 'file';

// MODULE'S FUNCTIONS
/**
 * Factory to create CLI command.
 * @param {object} deps
 * @param {TeqFw_Db_Back_Defaults} deps.DEF
 * @param {TeqFw_Log_Provider} deps.logger
 * @param {TeqFw_Db_Back_Cli_Dto_Command__Factory} deps.fCommand
 * @param {TeqFw_Db_Back_Cli_Dto_Command_Option__Factory} deps.fOpt
 * @param {TeqFw_Db_Back_App_Shutdown} deps.app
 * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
 * @param {TeqFw_Db_Back_Util} deps.util
 * @param {TeqFw_Db_Back_Act_Dem_RdbTables} deps.actTables
 * @param {TeqFw_Db_Back_Cli_Export_A_Select} deps.aExport
 * @param {TeqFw_Db_Back_Dto_Export} deps.dtoExport
 * @param {any} deps.fs
 * @returns {TeqFw_Db_Back_Cli_Dto_Command}
 * @memberOf TeqFw_Db_Back_Cli_Export
 */
export default function Factory({DEF, logger, fCommand, fOpt, app, conn, util, actTables, aExport, dtoExport, fs}) {
    const log = logger.forSource('TeqFw_Db_Back_Cli_Export');

    // FUNCS
    /**
     * Command action.
     * @param {Object} opts
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Export
     */
    async function action(opts) {
        const filename = opts[OPT_FILE];
        if (filename) {
            log.info(`Exporting data from the RDB into '${filename}'...`);
            const trx = await conn.startTransaction();
            try {
                // load DEM and get list of tables in dependency order
                const {tables} = await actTables.run();
                // read all rows from all tables
                const exp = dtoExport.createDto();
                for (const table of tables) {
                    try {
                        const {items} = await aExport.run({trx, table});
                        const name = table.name;
                        const count = items.length;
                        exp.tables[name] = items;
                        log.info(`Total '${count}' rows are exported for table '${name}'.`);
                    } catch (e) {
                        log.error('Table export failed.', {err: e, table: table.name});
                    }
                }
                // serials for Postgres
                const isPg = trx.isPostgres();
                if (isPg) exp.serials = await util.pgSerialsGet(trx);
                await trx.commit();
                // write out JSON to the specified file
                const json = JSON.stringify(exp);
                fs.writeFileSync(filename, json);
                log.info(`All RDB data is exported into '${filename}'.`);
            } catch (error) {
                await trx.rollback();
                log.error('RDB export failed.', {err: error});
            }
        } else {
            log.error('A JSON output filename is required for RDB export.');
        }
        await app.stop();
    }

    Object.defineProperty(action, 'namespace', {value: NS});

    // MAIN
    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'export';
    res.desc = 'export all data from the RDB';
    res.action = action;
    // add option --file
    const optFile = fOpt.create();
    optFile.flags = `-f, --${OPT_FILE} <path>`;
    optFile.description = `the path to the JSON file where you exported the data from the RDB`;
    res.opts.push(optFile);
    return res;
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            DEF: 'TeqFw_Db_Back_Defaults$',
            logger: 'TeqFw_Log_Provider$',
            fCommand: 'TeqFw_Db_Back_Cli_Dto_Command__Factory$',
            fOpt: 'TeqFw_Db_Back_Cli_Dto_Command_Option__Factory$',
            app: 'TeqFw_Db_Back_App_Shutdown$',
            conn: 'TeqFw_Db_Back_RDb_Connect$',
            util: 'TeqFw_Db_Back_Util$',
            actTables: 'TeqFw_Db_Back_Act_Dem_RdbTables$',
            aExport: 'TeqFw_Db_Back_Cli_Export_A_Select$',
            dtoExport: 'TeqFw_Db_Back_Dto_Export$',
            fs: "node:fs",
    }),
});
