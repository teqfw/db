// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem
 * @description TeqFW database package module.
 */

/**
 * Load DEM data for a plugin and parse it.
 *
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Util_File} deps.file
     */
    constructor({file}) {
        /**
         * Load DEM data for a plugin and parse it.
         * @param {object} deps
         * @param {string} deps.filename
         * @returns {Promise<object>}
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
