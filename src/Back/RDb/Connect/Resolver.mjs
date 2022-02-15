/**
 * Resolve entities names to tables names according to connection configuration.
 */
export default class TeqFw_Db_Back_RDb_Connect_Resolver {
    constructor(spec) {
        // DEPS
        /** @type {TeqFw_Db_Back_Defaults} */
        const DEF = spec['TeqFw_Db_Back_Defaults$'];

        // DEFINE WORKING VARS / PROPS
        /** @type {TeqFw_Db_Back_Dto_Config_Schema} */
        let _cfg;
        // DEFINE INSTANCE METHODS

        /**
         *
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
         * @return {string|string}
         */
        this.getTableName = function (meta) {
            const entity = meta.getEntityName();
            const prefix = _cfg?.prefix;
            const partsAll = entity.split(DEF.PS)
            const partsPath = (entity.charAt(0) === DEF.SCOPE_CHAR)
                ? partsAll.slice(2) // @vnd/plugin/...
                : partsAll.slice(1); // plugin/...
            const path = partsPath.join(DEF.NS)
            return ((typeof prefix === 'string') && (prefix.length > 0))
                ? `${prefix}${DEF.NS}${path}` : path;
        }
        /**
         * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
         */
        this.setConfig = (cfg) => _cfg = cfg;
    }
}
