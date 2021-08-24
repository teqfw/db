/**
 * Normalize DEM:
 *   - set paths to entities;
 *   - apply mapping to relations;
 */

// MODULE'S FUNCTIONS
/**
 * Normalize names and paths.
 *
 * @param {string} data
 * @return {string}
 */
function normName(data) {
    return data.toLowerCase().trim();
}

// MODULE'S CLASSES
/**
 * @implements TeqFw_Core_Shared_Api_IProcess
 */
export default class TeqFw_Db_Back_Process_Norm {
    /** @type {TeqFw_Db_Back_Defaults} */
    #DEF;

    constructor(spec) {
        this.#DEF = spec['TeqFw_Db_Back_Defaults$'];
    }

    /**
     * @param {TeqFw_Db_Back_Dto_Dem} dem
     * @return {Promise<TeqFw_Db_Back_Dto_Dem>}
     */
    async exec({dem}) {
        // DEFINE INNER FUNCTIONS

        /**
         * @param {TeqFw_Db_Back_Dto_Dem|TeqFw_Db_Back_Dto_Dem_Package} dem
         * @param {string} current current path
         * @param {string} ps path separator
         */
        function setPaths(dem, current, ps) {
            // set path to entities on the current level
            if (typeof dem.entity === 'object') {
                for (const eName of Object.keys(dem.entity)) {
                    /** @type {TeqFw_Db_Back_Dto_Dem_Entity} */
                    const entity = dem.entity[eName];
                    entity.path = normName(current);
                    // normalize relation references paths
                    if (typeof entity.relation === 'object') {
                        for (const relName of Object.keys(entity.relation)) {
                            /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation} */
                            const relation = entity.relation[relName];
                            const ref = relation.ref;
                            ref.path = normName(ref.path);
                        }
                    }
                }
            }
            // set path to packages on the current level
            if (typeof dem.package === 'object') {
                for (const name of Object.keys(dem.package)) {
                    const pkg = dem.package[name];
                    const path = normName(`${current}${name}${ps}`);
                    setPaths(pkg, path, ps);
                }
            }
        }

        /**
         * @param {TeqFw_Db_Back_Dto_Dem} dem
         */
        function applyMapping(dem) {
            // DEFINE INNER FUNCTIONS
            /**
             * @param {Object<string, TeqFw_Db_Back_Dto_Dem_Map>} map
             * @param {TeqFw_Db_Back_Dto_Dem|TeqFw_Db_Back_Dto_Dem_Package} pkg
             */
            function processPackage(map, pkg) {
                if (typeof pkg.entity === 'object') {
                    for (const key of Object.keys(pkg.entity)) {
                        /** @type {TeqFw_Db_Back_Dto_Dem_Entity} */
                        const entity = pkg.entity[key];
                        for (const key of Object.keys(entity?.relation)) {
                            const rel = entity.relation[key];
                            const ref = rel.ref;
                            if (typeof map[ref.path] === 'object') {
                                /** @type {TeqFw_Db_Back_Dto_Dem_Map} */
                                const mapItem = map[ref.path];
                                ref.path = mapItem.path;
                                const attrs = [];
                                for (const one of ref.attrs) {
                                    if (mapItem.attrs[one]) {
                                        attrs.push(mapItem.attrs[one]);
                                    } else {
                                        attrs.push(one);
                                    }
                                }
                                ref.attrs = attrs;
                            }
                        }
                    }
                }
                if (typeof pkg.package === 'object') {
                    for (const key of Object.keys(pkg.package))
                        processPackage(map, pkg.package[key]);
                }
            }

            // MAIN FUNCTIONALITY
            const map = dem?.map;
            if (typeof map === 'object') {
                processPackage(map, dem);
            }
        }

        // MAIN FUNCTIONALITY
        setPaths(dem, this.#DEF.PS, this.#DEF.PS);
        applyMapping(dem);
        return dem;
    }
}
