/**
 * Manually started script to develop schema related functionality (drop/create tables from DEM).
 */
import container from '../../DevEnv.mjs';
import dem from './Z/DemLoader.mjs';

// get objects with DI
/** @type {TeqFw_Db_Back_RDb_IConnect} */
const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
/** @type {TeqFw_Db_Back_RDb_ISchema} */
const schema = await container.get('TeqFw_Db_Back_RDb_ISchema$');


//
// DEV MAIN CONTENT
//

schema.setDem({dem});
await schema.dropAllTables({conn});
await schema.createAllTables({conn});
conn.disconnect();
debugger
