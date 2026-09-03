// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Connect_Resolver
 * @description TeqFW database package module.
 */

/**
 * Resolve entities names to tables names according to connection configuration.
 */
export default class TeqFw_Db_Back_RDb_Connect_Resolver {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Defaults} deps.DEF
     */
    constructor({DEF}) {
        // VARS
        /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
        let _cfg;
        // INSTANCE METHODS

        /**
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
         * @returns {any}
         */
        this.getTableName = function (meta) {
            const entity = meta.getEntityName();
            const prefix = _cfg?.prefix;
            const partsAll = entity.split(DEF.PS);
            const partsPath = (entity.charAt(0) === DEF.SCOPE_CHAR)
                ? partsAll.slice(2) // @vnd/plugin/...
                : partsAll.slice(1); // plugin/...
            const path = partsPath.join(DEF.NS);
            return ((typeof prefix === 'string') && (prefix.length > 0))
                ? `${prefix}${DEF.NS}${path}` : path;
        };
        /**
         * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
         * @returns {any}
         */
        this.setConfig = (cfg) => _cfg = cfg;
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            DEF: 'TeqFw_Db_Back_Defaults$',
    }),
});
