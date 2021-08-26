/**
 * DTO with table foreign key data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Relation';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_RDb_Relation {
    /** @type {string[]} */
    itsColumns;
    /** @type {string} */
    itsTable;
    /** @type {string} */
    name;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Action} */
    onDelete;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Action} */
    onUpdate;
    /** @type {string[]} */
    ownColumns;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_RDb_Relation.ITS_COLUMNS = 'itsColumns';
TeqFw_Db_Back_Dto_RDb_Relation.ITS_TABLE = 'itsTable';
TeqFw_Db_Back_Dto_RDb_Relation.NAME = 'name';
TeqFw_Db_Back_Dto_RDb_Relation.ON_DELETE = 'onDelete';
TeqFw_Db_Back_Dto_RDb_Relation.ON_UPDATE = 'onUpdate';
TeqFw_Db_Back_Dto_RDb_Relation.OWN_COLUMNS = 'ownColumns';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Relation
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Relation|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Relation}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Relation();
            res.itsColumns = Array.isArray(data?.itsColumns) ? data.itsColumns : [];
            res.itsTable = data?.itsTable;
            res.name = data?.name;
            res.onDelete = data?.onDelete;
            res.onUpdate = data?.onUpdate;
            res.ownColumns = Array.isArray(data?.ownColumns) ? data.ownColumns : [];
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Relation);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
