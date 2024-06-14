/**
 * Order DEM entities (dependencies go first: [base, dep, ...]).
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_RDb_Schema_A_Order {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
     * @param {TeqFw_Db_Back_Dto_Dem_Entity.Factory} factEntity
     */
    constructor(
        {
            TeqFw_Core_Shared_Logger$$: logger, // inject the implementation
            'TeqFw_Db_Back_Dto_Dem_Entity.Factory$': factEntity,
        }
    ) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Back_Dto_Dem} dem
         * @param {boolean} addDeprecated
         * @return {Promise<TeqFw_Db_Back_Dto_Dem_Entity[]>}
         */
        this.exec = async function ({dem, addDeprecated}) {
            // FUNCS

            /**
             * Compose object with deprecated tables to drop.
             * @param {TeqFw_Db_Back_Dto_Dem} dem
             * @return {Object<string, TeqFw_Db_Back_Dto_Dem_Entity[]>}
             */
            function collectDeprecated(dem) {
                // FUNCS
                /**
                 * '/web/event/front' => {name:'front', path:'/web/event'}
                 * @param fqn
                 * @return {{path: string, name: string}}
                 */
                function splitName(fqn) {
                    const parts = fqn.split('/');
                    const name = parts.pop();
                    const path = parts.join('/');
                    return {name, path: `${path}/`};
                }

                // MAIN
                const res = {};
                if (typeof dem?.deprecated === 'object') {
                    for (const key of Object.keys(dem.deprecated)) {
                        const entity = factEntity.create();
                        const {name, path} = splitName(key);
                        entity.name = name;
                        entity.path = path;
                        const deps = dem.deprecated[key];
                        const relations = {};
                        for (const one of deps) {
                            relations[one] = {ref: {path: one}}; // part of relation, reference to other table in FK
                        }
                        entity.relation = relations;
                        res[key] = entity;
                    }
                }
                return res;
            }

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
                        const address = `${entity.path}${entity.name}`;
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
                /**
                 * The map where the key is the name of an entity and the value is an array of other entities
                 * that have a foreign key to this entity.
                 *
                 * @type {Object<string, Array>}
                 */
                const successors = {}; // {/user => [/app/profile, ...]}
                /**
                 * The weights for every entity ({['/user']:8, ...})
                 * @type {Object<string, number>}
                 */
                const weights = {};

                // FUNCS
                /**
                 * Recursive function to update items weights in hierarchy.
                 * 1 - item has no deps, 2 - item has one dep's level below, ...
                 *
                 * @param {string} name
                 * @param {number} weight
                 * @param {string[]} paths
                 */
                function setWeights(name, weight, paths) {
                    if (paths.includes(name)) {
                        logger.error(`The entity '${name}' has a circular dependency: ${JSON.stringify(paths)}.`);
                    } else {
                        if (weights[name]) weight = weights[name] + 1;
                        // increment weights for all successors of the current entity
                        if (successors[name])
                            for (const one of successors[name]) {
                                if (one !== name) {
                                    const pathDeep = [...paths, name];
                                    if (weights[one]) {
                                        setWeights(one, weights[one] + 1, pathDeep);
                                    } else {
                                        setWeights(one, 1, pathDeep);
                                    }
                                }
                            }
                    }
                    weights[name] = weight;
                }

                // MAIN
                // collect items successors
                for (const pathThis of Object.keys(entities)) {
                    const entity = entities[pathThis];
                    if (typeof entity.relation === 'object') {
                        // this entity has references to other entities
                        for (const key of Object.keys(entity.relation)) {
                            /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation} */
                            const rel = entity.relation[key];
                            const pathOther = rel.ref.path;
                            // the other entity does not have incoming relations yet.
                            if (!successors[pathOther]) successors[pathOther] = [];
                            // add the current path to the set of successors of other entity
                            if (!successors[pathOther].includes(pathThis))
                                successors[pathOther].push(pathThis);
                        }
                    }
                }
                // set weights for all successors
                for (const path of Object.keys(entities))
                    setWeights(path, 1, []);

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

            // MAIN
            let entities = collectEntities(dem);
            if (addDeprecated) {
                const deprecated = collectDeprecated(dem);
                entities = Object.assign(entities, deprecated);
            }
            const levels = composeLevels(entities);
            return mapEntitiesByLevel(entities, levels);
        };
    }
}
