/**
 * Initialize development environment to run dev tests.
 */
import {join, dirname} from 'path';
import Container from '@teqfw/di';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const pathPrj = join(pathScript, '../..');
const pathDev = join(pathPrj, './dev');
const pathNode = join(pathPrj, '../../../node_modules');
const srcTeqFwDi = join(pathNode, '@teqfw/di/src');
const srcTeqFwCore = join(pathNode, '@teqfw/core/src');
const srcTeqFwDb = join(pathNode, '@teqfw/db/src');

/* Create and setup DI container (once per all imports) */

/** @type {TeqFw_Di_Shared_Container} */
const container = new Container();
// add backend sources to map
container.addSourceMapping('TeqFw_Di', srcTeqFwDi, true, 'mjs');
container.addSourceMapping('TeqFw_Core', srcTeqFwCore, true, 'mjs');
container.addSourceMapping('TeqFw_Db', srcTeqFwDb, true, 'mjs');
// setup replacements
container.addModuleReplacement('TeqFw_Db_Back_RDb_ISchema', 'TeqFw_Db_Back_RDb_Schema');

// init logger
/** @type {TeqFw_Core_Shared_Logger} */
const logger = await container.get('TeqFw_Core_Shared_Logger$');
logger.pause(false);

// load local config
/** @type {TeqFw_Core_Back_Config} */
const config = await container.get('TeqFw_Core_Back_Config$');
config.loadLocal(pathDev);
const local = config.getLocal();

// init DB connection
/** @type {TeqFw_Db_Back_Defaults} */
const DEF = await container.get('TeqFw_Db_Back_Defaults$');
/** @type {TeqFw_Db_Back_RDb_Connect} */
const conn = await container.get('TeqFw_Db_Back_RDb_Connect$');
const dbCfg = local[DEF.NAME];
await conn.init(dbCfg.mariadb);
// await conn.init(dbCfg.pg);
container.set('TeqFw_Db_Back_RDb_IConnect$', conn);

export default container;
