/**
 * Compose schema configuration from DEMs union and map file.
 *
 * @implements TeqFw_Core_Shared_Api_Action_IAsync
 */
export default class TeqFw_Db_Back_Dem_Load_A_SchemaCfg {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Db_Back_Dto_Config_Schema.Factory} */
        const factory = spec['TeqFw_Db_Back_Dto_Config_Schema#Factory$'];

        // noinspection JSCheckFunctionSignatures
        /**
         * Load DEM mapping data for the application and parse it.
         * @param {TeqFw_Db_Back_Dto_Map} map
         * @return {Promise<{cfg: TeqFw_Db_Back_Dto_Config_Schema}>}
         */
        this.exec = async function ({map}) {
            /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
            const cfg = factory.create();
            cfg.prefix = map.namespace;
            return {cfg};
        }
    }
}
