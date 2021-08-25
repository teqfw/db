/**
 * Scan project to DEM definitions and compose DEM DTO.
 */
// MODULE'S IMPORT
import {join} from 'path';

// MODULE'S VARS
const DEM = 'teqfw.schema.json';

/**
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_RDb_Schema_A_Scan {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {Function|TeqFw_Core_Back_Util.readJson} */
        const readJson = spec['TeqFw_Core_Back_Util#readJson'];
        /** @type {Function|TeqFw_Core_Back_Util.scanNodeModules} */
        const scanNodeModules = spec['TeqFw_Core_Back_Util#scanNodeModules'];
        /** @type {Function|TeqFw_Core_Shared_Util.deepMerge} */
        const deepMerge = spec['TeqFw_Core_Shared_Util#deepMerge'];
        /** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
        const fDem = spec['TeqFw_Db_Back_Dto_Dem#Factory$'];

        // DEFINE INSTANCE METHODS
        /**
         * Scan project to DEM definitions and compose DEM DTO.
         * @param {string} path
         * @return {Promise<TeqFw_Db_Back_Dto_Dem>}
         */
        this.exec = async function ({path}) {
            const pathBase = join(path, DEM);
            const jsonBase = readJson(pathBase) ?? {};
            const filenames = scanNodeModules(path, DEM);
            for (const file of filenames) {
                const json = readJson(file);
                deepMerge(jsonBase, json);
            }
            return fDem.create(jsonBase);
        }
    }
}
