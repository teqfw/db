/**
 * DTO for mapping data (paths mapping, references resolutions in plugins, tables namespace).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Map';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Map {
    /**
     * List of deprecated tables with dependencies (foreign keys).
     * @type {Object<string, string[]>}
     */
    deprecated;
    /**
     * Prefix for tables in RDB ('teq' => 'teq_table_name'). Default: use w/o prefix.
     * @type {string}
     */
    namespace;
    /**
     * Plugin's references resolutions (map plugin's external reference to existing entity & attr).
     * @type {Object<string, Object<string, TeqFw_Db_Back_Dto_Map_Ref>>}
     */
    ref;
}

// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_Map.REF = 'ref';
TeqFw_Db_Back_Dto_Map.NAMESPACE = 'namespace';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Map
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Back_Dto_Map_Ref.Factory} fRef
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'TeqFw_Db_Back_Dto_Map_Ref.Factory$': fRef,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Map|null} data
         * @returns {TeqFw_Db_Back_Dto_Map}
         */
        this.create = function create(data = null) {
            // FUNCS

            function parseDeprecated(data) {
                const res = {};
                if (typeof data === 'object')
                    for (const name of Object.keys(data))
                        res[name] = cast.arrayOfStr(data[name]);
                return res;
            }

            function parseRef(data) {
                const res = {};
                if (typeof data === 'object')
                    for (const name of Object.keys(data)) {
                        res[name] = {};
                        for (const path of Object.keys(data[name])) {
                            const item = fRef.create(data[name][path]);
                            item.alias = path;
                            res[name][path] = item;
                        }
                    }
                return res;
            }

            // MAIN
            const res = new TeqFw_Db_Back_Dto_Map();
            res.deprecated = parseDeprecated(data?.deprecated);
            res.namespace = data?.namespace;
            res.ref = parseRef(data?.ref);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Map);
