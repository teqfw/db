/**
 * Import all the data from the JSON file into a Relational Database (RDB).
 *
 * @namespace TeqFw_Db_Back_Cli_Import
 */
// MODULE'S IMPORT

// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Cli_Import';
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
 * @param {TeqFw_Core_Back_Util_File} utilFile
 * @param {TeqFw_Db_Back_Api_Import_Transform} transform
 * @param {TeqFw_Db_Back_Act_Dem_Tables} aDemTables
 *
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 * @constructor
 * @memberOf TeqFw_Db_Back_Cli_Import
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
        TeqFw_Core_Back_Util_File$: utilFile,
        TeqFw_Db_Back_Api_Import_Transform$: transform,
        TeqFw_Db_Back_Act_Dem_Tables$: aDemTables,
    }
) {

    // FUNCS
    /**
     * Command action.
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Cli_Import
     */
    async function action(opts) {
        const filename = opts[OPT_FILE];
        if (filename) {
            logger.info(`Importing data from the '${filename}'...`);
            const trx = await conn.startTransaction();
            try {
                // prepare RDBMS engine
                if (trx.isMariaDB()) {
                    // to prevent MariaDB from errors like 'ER_TRUNCATED_WRONG_VALUE'
                    await trx.getKnexTrx().raw(`SET SESSION sql_mode = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';`);
                }
                // read JSON with data
                /** @type {TeqFw_Db_Back_Dto_Export.Dto} */
                const dump = utilFile.readJson(filename);
                // load DEM and get list of tables in dependency order
                const demTables = await aDemTables.act();
                // Process all tables from the current version of the schema in the order of their dependencies.
                for (const name of demTables) {
                    // prepare the imported data to be inserted into rdb
                    const tableRows = transform.prepareTables(trx, dump.tables, name);
                    await util.itemsInsert(trx, name, tableRows);
                }
                // update serials
                if (trx.isPostgres() && dump.serials) {
                    const schema = conn.getSchemaBuilder();
                    const norm = transform.prepareSerials(dump.serials);
                    await util.pgSerialsSet(schema, norm);
                }
                await trx.commit();
                logger.info(`All RDB data from '${filename}' is imported.`);
            } catch (error) {
                await trx.rollback();
                logger.error(error);
            }
        } else {
            logger.error(`You need to provide a file name with the dump to be imported into RDB.`);
        }
        await app.stop();
    }

    Object.defineProperty(action, 'namespace', {value: NS});

    // MAIN
    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'import';
    res.desc = 'import all data into the RDB';
    res.action = action;
    // add option --file
    const optFile = fOpt.create();
    optFile.flags = `-f, --${OPT_FILE} <path>`;
    optFile.description = `the path to the location where the imported JSON data is stored`;
    res.opts.push(optFile);
    return res;
}
