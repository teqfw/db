import container from '../DevEnv.mjs';

// get database connector then execute the process
/** @type {TeqFw_Db_Back_RDb_Schema_Builder} */
const builder = await container.get('TeqFw_Db_Back_RDb_Schema_Builder$');
debugger
