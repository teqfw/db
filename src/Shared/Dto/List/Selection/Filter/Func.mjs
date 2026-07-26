// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Func
 * @description TeqFW database package module.
 */

/**
 *  The 'func' node used in the selection filter.
 *  @namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Func
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Func';

/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Func
 * @type {Object}
 */
const ATTR = {
    NAME: 'name',
    PARAMS: 'params',
};
Object.freeze(ATTR);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Func
 */
class Dto {
    static namespace = NS;
    /**
     * @type {string}
     * @see TeqFw_Db_Shared_Enum_Filter_Func
     */
    name;
    /**
     * TODO: alias is a column in a result set, value - is a `tbl.col` pair.
     * @type {(
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias.Dto|
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Value.Dto|
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto
     * )[]}
     */
    params;
}

/**
 */
export default class TeqFw_Db_Shared_Dto_List_Selection_Filter_Func {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias} deps.dtoAlias
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Value} deps.dtoValue
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Func} deps.FN
     */
    constructor({cast, dtoAlias, dtoValue, FN}) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto} data
         * @returns {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto}
         */
        this.createDto = function (data) {
            // create a new DTO and populate it with initialization data
            const res = new Dto();
            // cast known attributes
            res.name = cast.enum(data?.name, FN);
            res.params = [];
            if (Array.isArray(data?.params))
                for (const one of data.params) {
                    if (one?.alias) res.params.push(dtoAlias.createDto(one));
                    else if (one?.value) res.params.push(dtoValue.createDto(one));
                    else if (one?.name) this.createDto(one);
                }
            return res;
        };

        /**
         * @returns {any}
         */
        this.getAttributes = () => ATTR;
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            dtoAlias: 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias$',
            dtoValue: 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Value$',
            FN: 'TeqFw_Db_Shared_Enum_Filter_Func__default',
    }),
});
