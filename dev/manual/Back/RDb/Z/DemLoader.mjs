import {dirname, join} from 'path';
import container from '../../../DevEnv.mjs';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const pathDev = join(pathScript, '../../../../../dev');
const fileDemApp = join(pathDev, 'etc/base/dem.app.json');
const fileDemUser = join(pathDev, 'etc/base/dem.user.json');
const fileMap = 'etc/base/map.json'

// get objects with DI
const {readJson} = await container.get('TeqFw_Core_Back_Util');
/** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
const fDem = await container.get('TeqFw_Db_Back_Dto_Dem#Factory$');
/** @type {TeqFw_Db_Back_Dem_Norm} */
const aNorm = await container.get('TeqFw_Db_Back_Dem_Norm$');
/** @type {TeqFw_Db_Back_Dem_Load_Map} */
const aLoadMap = await container.get('TeqFw_Db_Back_Dem_Load_Map$');

//
// DEV MAIN CONTENT
//
// read DEM as an object
const jsonApp = readJson(fileDemApp);
const jsonUser = readJson(fileDemUser);
const demApp = fDem.create(jsonApp);
const demUser = fDem.create(jsonUser);
const dems = {app: demApp, user: demUser};
const map = await aLoadMap.exec({path: pathDev, filename: fileMap});
const dem = await aNorm.exec({dems, map});

export default dem;
