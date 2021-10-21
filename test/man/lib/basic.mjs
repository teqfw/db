/**
 * Library with functions to help with manual basic tests.
 */

import {join} from 'path';

/**
 * This function has classic input-output interface (low variability is expected).
 * @param {TeqFw_Di_Shared_Container} container
 * @param {string} pathData
 * @return {Promise<{cfg: TeqFw_Db_Back_Dto_Config_Schema, dem: TeqFw_Db_Back_Dto_Dem}>}
 */
export async function load(container, pathData) {
    /** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} */
    const loadDem = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$');
    /** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} */
    const loadMap = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$');
    /** @type {TeqFw_Db_Back_Dem_Load_A_Norm} */
    const norm = await container.get('TeqFw_Db_Back_Dem_Load_A_Norm$');
    /** @type {TeqFw_Db_Back_Dem_Load_A_SchemaCfg} */
    const schemaCfg = await container.get('TeqFw_Db_Back_Dem_Load_A_SchemaCfg$');

    // prepare this unit runtime objects
    const pathDem = join(pathData, 'dem.json');
    const pathMap = join(pathData, 'map.json');
    const demApp = await loadDem.exec({filename: pathDem});
    const map = await loadMap.exec({filename: pathMap});
    const dems = {app: demApp};
    const {dem} = await norm.exec({dems, map});
    const {cfg} = await schemaCfg.exec({map});
    return {dem, cfg};
}
