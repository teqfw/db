/**
 * DTO for DEM 'ref' (reference to external entities and attributes).
 * This DTO is used in 'TeqFw_Db_Back_RDb_Schema_A' namespace only.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_RDb_Schema_A_Dto_Ref';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_RDb_Schema_A_Dto_Ref {
    /**
     * Path to referencing entity.
     * @type {string}
     */
    path;
    /**
     * Attributes of the referencing entity that are used in relations.
     * @type {string[]}
     */
    attrs;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_RDb_Schema_A_Dto_Ref
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_RDb_Schema_A_Dto_Ref|null} data
         * @return {TeqFw_Db_Back_RDb_Schema_A_Dto_Ref}
         */
        this.create = function create(data = null) {
            const res = new TeqFw_Db_Back_RDb_Schema_A_Dto_Ref();
            res.path = data?.path;
            res.attrs = (Array.isArray(data?.attrs)) ? [...data.attrs] : [];
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_RDb_Schema_A_Dto_Ref);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});