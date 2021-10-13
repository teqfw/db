/**
 * Manually started script to develop schema related functionality (drop/create tables from DEM).
 */
import {dirname, join} from 'path';
import container from '../../DevEnv.mjs';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const path = join(pathScript, '../../../../../../../');

// get objects with DI
/** @type {TeqFw_Db_Back_RDb_IConnect} */
const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
/** @type {TeqFw_Db_Back_RDb_ISchema} */
const schema = await container.get('TeqFw_Db_Back_RDb_ISchema$');


//
// DEV MAIN CONTENT
//
await schema.loadDem({path});
await schema.dropAllTables({conn});

debugger
