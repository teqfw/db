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
     */
    constructor({file}) {
        /**
         * Load DEM mapping data for the application and parse it.
         * @param {object} deps
         * @param {object} deps.filename
         * @returns {Promise<any>}
         */
        this.exec = async function ({filename}) {
            return file.readJson(filename) ?? {};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            file: "TeqFw_Db_Back_Util_File$",
    }),
});
