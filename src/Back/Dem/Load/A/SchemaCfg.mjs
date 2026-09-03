// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load_A_SchemaCfg
 * @description TeqFW database package module.
 */

/**
 * Compose schema configuration from DEMs union and map file.
 *
 */
export default class TeqFw_Db_Back_Dem_Load_A_SchemaCfg {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Config_Schema__Factory} deps.factory
     */
    constructor({factory}) {
        // noinspection JSCheckFunctionSignatures
        /**
         * Load DEM mapping data for the application and parse it.
         * @param {object} deps
         * @param {TeqFw_Db_Back_Dto_Map} deps.map
         * @returns {Promise<any>}
         */
        this.exec = async function ({map}) {
            /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
            const cfg = factory.create();
            cfg.prefix = map.namespace;
            return {cfg};
        }
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            factory: 'TeqFw_Db_Back_Dto_Config_Schema__Factory$',
    }),
});
