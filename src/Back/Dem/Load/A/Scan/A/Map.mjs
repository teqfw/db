// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load_A_Scan_A_Map
 * @description TeqFW database package module.
 */

/**
 * Load DEM mapping data for the application.
 * There is one only map file per application (in root plugin).
 *
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Map {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Util_File} deps.file
     * @param {TeqFw_Db_Back_Dto_Map.Factory} deps.factory
     */
    constructor({file, factory}) {
        /**
         * Load DEM mapping data for the application and parse it.
         * @param {object} deps
         * @param {string|null} deps.filename
         * @returns {Promise<TeqFw_Db_Back_Dto_Map>}
         */
        this.exec = async function ({filename}) {
            const json = file.readJson(filename) ?? {};
            return factory.create(json);
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            file: "TeqFw_Db_Back_Util_File$",
            factory: 'TeqFw_Db_Back_Dto_Map__Factory$',
    }),
});
