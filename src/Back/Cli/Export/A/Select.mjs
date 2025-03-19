/**
 * @implements TeqFw_Core_Shared_Api_Action
 */
export default class TeqFw_Db_Back_Cli_Export_A_Select {
    /**
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Column} COLUMN
     */
    constructor(
        {
            'TeqFw_Db_Back_Enum_Db_Type_Column.default': COLUMN,
        }
    ) {

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {TeqFw_Db_Back_Dto_RDb_Table} table
         * @returns {Promise<{items:Object[]}>}
         */
        this.run = async function ({trx, table}) {
            const knex = trx.getKnexTrx();
            const columns = table.columns;
            const cols = [];
            for (const one of columns) {
                if (one.type === COLUMN.DATE) {
                    cols.push(knex.raw(`??::text AS ??`, [one.name, one.name]));
                } else {
                    cols.push(one.name);
                }
            }
            const items = await knex.select(cols).from(table.name);
            return {items};
        };


    }
}
