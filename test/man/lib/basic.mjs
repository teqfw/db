/**
 * Library with functions to help with manual basic tests.
 */

import {join} from 'path';

/**
 * Load the legacy schema namespace configuration used by CrudEngine fixtures.
 * @param {TeqFw_Di_Container} container
 * @param {string} pathData
 * @returns {Promise<{cfg: TeqFw_Db_Back_Dto_Config_Schema}>}
 */
export async function load(container, pathData) {
    /** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} */
    const loadMap = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$');
    /** @type {TeqFw_Db_Back_Dem_Load_A_SchemaCfg} */
    const schemaCfg = await container.get('TeqFw_Db_Back_Dem_Load_A_SchemaCfg$');
    const map = await loadMap.exec({filename: join(pathData, 'map.json')});
    const {cfg} = await schemaCfg.exec({map});
    return {cfg};
}
