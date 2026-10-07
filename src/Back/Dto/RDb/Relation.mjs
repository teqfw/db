// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_RDb_Relation
 * @description TeqFW database package module.
 */

/**
 * DTO with table foreign key data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Relation';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_RDb_Relation {
    /** @type {unknown[] | undefined} */
    itsColumns;
    /** @type {string | undefined} */
    itsTable;
    /** @type {string | undefined} */
    name;
    /** @type {TeqFw_Db_StringOptional} */
    onDelete;
    /** @type {TeqFw_Db_StringOptional} */
    onUpdate;
    /** @type {unknown[] | undefined} */
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
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Enum_Db_Type_Action} deps.ACTION
     */
    constructor({cast, ACTION}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_RDb_Relation}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new TeqFw_Db_Back_Dto_RDb_Relation();
            res.itsColumns = cast.array(data?.itsColumns);
            res.itsTable = cast.string(data?.itsTable);
            res.name = cast.string(data?.name);
            const onDeleteValue = cast.enum(data?.onDelete, ACTION);
            res.onDelete = typeof onDeleteValue === 'string' ? onDeleteValue : undefined;
            const onUpdateValue = cast.enum(data?.onUpdate, ACTION);
            res.onUpdate = typeof onUpdateValue === 'string' ? onUpdateValue : undefined;
            res.ownColumns = cast.array(data?.ownColumns);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Relation);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            ACTION: 'TeqFw_Db_Back_Enum_Db_Type_Action__default',
    }),
});
