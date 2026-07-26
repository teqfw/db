// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem
 * @description TeqFW database package module.
 */

/**
 * Load DEM data for a plugin and parse it.
 *
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem {
    /**
     * @param {TeqFw_Db_Back_Util_File} file
     * @param {TeqFw_Db_Back_Dto_Dem.Factory} factory
     */
    constructor({file, factory}) {
        /**
         * Load DEM data for a plugin and parse it.
         * @param {string} filename full path name to file with DEM JSON
         * @returns {Promise<TeqFw_Db_Back_Dto_Dem>}
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
            factory: 'TeqFw_Db_Back_Dto_Dem__Factory$',
    }),
});
