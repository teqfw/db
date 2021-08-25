/**
 * Order DEM entities (dependencies go first: [base, dep, ...]).
 * @implements TeqFw_Core_Shared_Api_IProcess
 */
export default class TeqFw_Db_Back_Process_Order {
    /**
     * @param {TeqFw_Db_Back_Dto_Dem} dem
     * @return {Promise<TeqFw_Db_Back_Dto_Dem_Entity[]>}
     */
    async exec({dem}) {
        // DEFINE INNER FUNCTIONS

        /**
         * Collect entities from package and all subpackages.
         * @param {TeqFw_Db_Back_Dto_Dem|TeqFw_Db_Back_Dto_Dem_Package} dem
         * @return {Object<string, TeqFw_Db_Back_Dto_Dem_Entity>}
         */
        function collectEntities(dem) {
            const res = {};
            if (typeof dem.entity === 'object')
                for (const name of Object.keys(dem.entity)) {
                    /** @type {TeqFw_Db_Back_Dto_Dem_Entity} */
                    const entity = dem.entity[name];
                    const address = `${entity.path}${entity.name}`
                    res[address] = entity;
                }
            if (typeof dem.package === 'object')
                for (const name of Object.keys(dem.package))
                    Object.assign(res, collectEntities(dem.package[name]));
            return res;
        }

        /**
         * @param {Object<string, TeqFw_Db_Back_Dto_Dem_Entity>} entities
         * @return {{}}
         */
        function composeLevels(entities) {
            // PARSE INPUT & DEFINE WORKING VARS
            /** @type {Object<string, Array>} */
            const successors = {}; // {/user => [/app/profile, ...]}
            const weights = {};

            // DEFINE INNER FUNCTIONS
            /**
             * Recursive function to update items weights in hierarchy.
             * 1 - item has no deps, 2 - item has one dep's level below, ...
             *
             * Circular dependencies should be resolved externally.
             *
             * @param {string} name
             * @param {number} weight
             */
            function setWeights(name, weight) {
                if (weights[name]) weight = weights[name] + 1;
                if (successors[name])
                    for (const one of successors[name]) {
                        if (one !== name) {
                            if (weights[one]) {
                                setWeights(one, weights[one] + 1);
                            } else {
                                setWeights(one, 1);
                            }
                        }
                    }
                weights[name] = weight;
            }

            // MAIN FUNCTIONALITY
            // collect items successors
            for (const address of Object.keys(entities)) {
                const entity = entities[address];
                if (typeof entity.relation === 'object') {
                    for (const key of Object.keys(entity.relation)) {
                        /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation} */
                        const rel = entity.relation[key];
                        const dep = rel.ref.path;
                        if (!successors[dep]) successors[dep] = [];
                        if (!successors[dep].includes(address))
                            successors[dep].push(address);
                    }
                }
            }

            for (const address of Object.keys(entities)) setWeights(address, 1);
            // convert weights to levels
            const result = {};
            for (const name of Object.keys(weights)) {
                const weight = weights[name];
                if (!result[weight]) result[weight] = [];
                result[weight].push(name);
            }
            return result;
        }


        function mapEntitiesByLevel(entities, levels) {
            const res = [];
            const keys = Object.keys(levels).map(key => parseInt(key)); // get keys as integers
            keys.sort((a, b) => a - b); // sort as numbers
            for (const key of keys)
                for (const name of levels[key]) res.push(entities[name]);
            return res;
        }

        // MAIN FUNCTIONALITY
        const entities = collectEntities(dem);
        const levels = composeLevels(entities);
        return mapEntitiesByLevel(entities, levels);
    }
}
