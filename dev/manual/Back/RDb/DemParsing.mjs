import {dirname, join} from 'path';
import container from '../../DevEnv.mjs';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const pathPrj = join(pathScript, '../../../../../../../');
const fileDemApp = join(pathPrj, 'teqfw.schema.json');
const fileDemUser = join(pathPrj, 'node_modules/@flancer32/teq_user/teqfw.schema.json');

// get objects with DI
const {readJson} = await container.get('TeqFw_Core_Back_Util');
/** @type {Function|TeqFw_Core_Shared_Util.deepMerge} */
const deepMerge = await container.get('TeqFw_Core_Shared_Util#deepMerge');
/** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
const fDem = await container.get('TeqFw_Db_Back_Dto_Dem#Factory$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Norm} */
const procNorm = await container.get('TeqFw_Db_Back_RDb_Schema_A_Norm$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Order} */
const procOrder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Order$');


//
// DEV MAIN CONTENT
//
// read DEM as an object
const jsonApp = readJson(fileDemApp);
const jsonUser = readJson(fileDemUser);
const json = deepMerge(jsonApp, jsonUser);
const dem = fDem.create(json);
await procNorm.exec({dem});
const entities = await procOrder.exec({dem})

const bp = true;
