import {dirname, join} from 'path';
import container from '../../../../DevEnv.mjs';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const pathDev = join(pathScript, '../../../../../../dev');
const fileMap = 'etc/base/map.json';

// get objects with DI
/** @type {TeqFw_Db_Back_Act_Dem_Load_Map} */
const aLoadMap = await container.get('TeqFw_Db_Back_Act_Dem_Load_Map$');


//
// DEV MAIN CONTENT
//
// load MAP data as an DTO
const map = await aLoadMap.exec({path: pathDev, filename: fileMap});

const bp = true;
