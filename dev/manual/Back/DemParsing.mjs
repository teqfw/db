import {dirname, join} from 'path';
import container from '../DevEnv.mjs';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const pathPrj = join(pathScript, '../../../../../../');
const fileDem = join(pathPrj, 'teqfw.schema.json');

// get objects with DI
const {readJson} = await container.get('TeqFw_Core_Back_Util');
/** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
const fDem = await container.get('TeqFw_Db_Back_Dto_Dem#Factory$');


//
// DEV MAIN CONTENT
//
// read DEM as an object
const jsonApp = readJson(fileDem);
const dem = fDem.create(jsonApp);
debugger
