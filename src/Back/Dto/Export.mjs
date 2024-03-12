/**
 * The format in which the exported/imported information is organized.
 */
// MODULE'S VARIABLES
const NS = 'TeqFw_Db_Back_Dto_Export';

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Back_Dto_Export
 */
class Dto {
    static namespace = NS;
    /**
     * Contains all tables with data.
     * @type {Object<string, Object[]>}
     */
    tables;
    /**
     * Contains all serials (for PostgreSQL DBs).
     * @type {Object<string, string>}
     */
    serials;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class TeqFw_Db_Back_Dto_Export {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Export.Dto} [data]
         * @return {TeqFw_Db_Back_Dto_Export.Dto}
         */
        this.createDto = function (data) {
            // create a new DTO
            const res = new Dto();
            // cast known attributes
            res.tables = cast.object(data?.tables);
            res.serials = cast.object(data?.serials);
            return res;
        };
    }
}
