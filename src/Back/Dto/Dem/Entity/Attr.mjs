/**
 * DTO for DEM 'entity/attr'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Attr';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Attr {
    /** @type {string} */
    comment;
    /** @type {string|number|boolean} */
    default;
    /** @type {string} */
    name;
    /** @type {boolean} */
    nullable;
    /** @type {Object} */
    options;
    /** @type {string} */
    type;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Attr
 */
export class Factory {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options.Factory} */
        const fOPts = spec['TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Attr}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr();
            res.comment = data?.comment;
            res.default = data?.default;
            res.name = data?.name;
            res.nullable = data?.nullable;
            res.options = fOPts.create(data?.options);
            res.type = data?.type;
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
