/**
 * Normalize DEM:
 *   - set paths to entities;
 *   - apply mapping to relations;
 *   - merge fragments into one object;
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
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_Api_Act_Dem_Norm {

    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Db_Back_Api_Defaults} */
        const $DEF = spec['TeqFw_Db_Back_Api_Defaults$'];
        /** @type {Function|TeqFw_Core_Shared_Util.deepMerge} */
        const $deepMerge = spec['TeqFw_Core_Shared_Util#deepMerge'];
        /** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
        const $fDem = spec['TeqFw_Db_Back_Dto_Dem#Factory$'];


        // DEFINE INSTANCE METHODS
        /**
         * @param {Object<string, TeqFw_Db_Back_Dto_Dem>} dems
         * @param {Object<string, Object<string, TeqFw_Db_Back_Dto_Map>>} map
         * @return {Promise<TeqFw_Db_Back_Dto_Dem>}
         */
        this.exec = async function ({dems, map}) {
            // DEFINE INNER FUNCTIONS

            /**
             * @param {TeqFw_Db_Back_Dto_Dem|TeqFw_Db_Back_Dto_Dem_Package} dem
             * @param {Object<string, TeqFw_Db_Back_Dto_Map>} map
             * @param {string} current current path
             * @param {string} ps path separator
             */
            function setPaths(dem, map, current, ps) {
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
                                // apply mapping for references
                                if (map && (typeof map[ref.path] === 'object')) {
                                    const mapItem = map[ref.path];
                                    ref.path = normName(mapItem.path);
                                    for (const i in ref.attrs) {
                                        const attr = ref.attrs[i];
                                        if (mapItem.attrs[attr]) ref.attrs[i] = mapItem.attrs[attr];
                                    }
                                }
                            }
                        }
                    }
                }
                // set path to packages on the current level
                if (typeof dem.package === 'object') {
                    for (const name of Object.keys(dem.package)) {
                        const pkg = dem.package[name];
                        const path = normName(`${current}${name}${ps}`);
                        setPaths(pkg, map, path, ps);
                    }
                }
            }

            // MAIN FUNCTIONALITY
            /** @type {TeqFw_Db_Back_Dto_Dem} */
            const res = $fDem.create();
            delete res.refs;

            for (const plugin of Object.keys(dems)) {
                // make a copy of the DEM fragment
                const part = JSON.parse(JSON.stringify(dems[plugin]));
                // set full paths for entities taking into account references mapping
                setPaths(part, map[plugin], $DEF.PS, $DEF.PS);
                delete part.refs;
                $deepMerge(res, part);
            }

            return res;
        }
    }
}
