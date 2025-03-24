/**
 * Export all data from the RDB into a JSON file.
 *
 * @namespace TeqFw_Db_Back_Cli_Export
 */
// MODULE'S IMPORT
import {writeFileSync} from 'node:fs';

// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Cli_Export';
const OPT_FILE = 'file';

// MODULE'S FUNCTIONS
/**
 * Factory to create CLI command.
 *
 * @param {TeqFw_Db_Back_Defaults} DEF
 * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
 * @param {TeqFw_Core_Back_Api_Dto_Command.Factory} fCommand
 * @param {TeqFw_Core_Back_Api_Dto_Command_Option.Factory} fOpt
 * @param {TeqFw_Core_Back_App} app
 * @param {TeqFw_Db_Back_RDb_IConnect} conn
 * @param {TeqFw_Db_Back_Util} util
 * @param {TeqFw_Db_Back_Act_Dem_RdbTables} actTables
 * @param {TeqFw_Db_Back_Cli_Export_A_Select} aExport
 * @param {TeqFw_Db_Back_Dto_Export} dtoExport
 *
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Db_Back_Cli_Export
 */
export default function Factory(
    {
        TeqFw_Db_Back_Defaults$: DEF,
        TeqFw_Core_Shared_Api_Logger$$: logger,
        'TeqFw_Core_Back_Api_Dto_Command.Factory$': fCommand,
        'TeqFw_Core_Back_Api_Dto_Command_Option.Factory$': fOpt,
        TeqFw_Core_Back_App$: app,
        TeqFw_Db_Back_RDb_IConnect$: conn,
        TeqFw_Db_Back_Util$: util,
        TeqFw_Db_Back_Act_Dem_RdbTables$: actTables,
        TeqFw_Db_Back_Cli_Export_A_Select$: aExport,
        TeqFw_Db_Back_Dto_Export$: dtoExport,
    }
) {

    // FUNCS
    /**
     * Command action.
     * @param {Object} [opts]
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Export
     */
    async function action(opts) {
        const filename = opts[OPT_FILE];
        if (filename) {
            logger.info(`Exporting data from the RDB into '${filename}'...`);
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
                        logger.info(`Total '${count}' rows are exported for table '${name}'.`);
                    } catch (e) {
                        logger.exception(e);
                    }
                }
                // serials for Postgres
                const isPg = trx.isPostgres();
                if (isPg) exp.serials = await util.pgSerialsGet(trx);
                await trx.commit();
                // write out JSON to the specified file
                const json = JSON.stringify(exp);
                writeFileSync(filename, json);
                logger.info(`All RDB data is exported into '${filename}'.`);
            } catch (error) {
                await trx.rollback();
                logger.error(error);
            }
        } else {
            logger.error(`You need to provide a file name for the JSON output where you want to export data from the RDB.`);
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
