/**
 * Convert DEM DTO Entity to RDB DTO Table.
 *
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_RDb_Schema_A_Convert {
    /** @type {TeqFw_Db_Back_Defaults} */
    #DEF;
    /** @type {TeqFw_Db_Back_Dto_RDb_Table.Factory} */
    #fTable;

    constructor(spec) {
        this.#DEF = spec['TeqFw_Db_Back_Defaults$'];
        this.#fTable = spec['TeqFw_Db_Back_Dto_RDb_Table#Factory$'];
    }

    /**
     * Convert DEM DTO Entity to RDB DTO Table.
     *
     * @param {TeqFw_Db_Back_Dto_Dem_Entity} entity
     * @return {Promise<TeqFw_Db_Back_Dto_RDb_Table>}
     */
    async exec({entity}) {
        // DEFINE INNER FUNCTIONS
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity} entity
         * @param {string} PS path separator
         * @param {string} NS name separator
         * @return {string}
         */
        function getTableName(entity, PS, NS) {
            let res = `${entity.path}${entity.name}`;
            res = res.replace(new RegExp(PS, 'g'), NS);
            res = (res[0] === NS) ? res.substr(1) : res;
            return res;
        }

        // MAIN FUNCTIONALITY
        const res = this.#fTable.create();
        res.name = getTableName(entity, this.#DEF.PS, this.#DEF.NS);
        res.comment = entity.comment;
        return res;

    }
}
