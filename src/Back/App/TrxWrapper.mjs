/**
 * Utility class for managing database operations with transaction support.
 * This class ensures that operations are executed within a transaction context,
 * either provided externally or created internally.
 */
export default class TeqFw_Db_Back_App_TrxWrapper {
    /**
     * @param {TeqFw_Db_Back_RDb_IConnect} conn - Database connection interface.
     */
    constructor(
        {
            TeqFw_Db_Back_RDb_IConnect$: conn,
        }
    ) {
        /**
         * Executes a database operation within an outer transaction or created transaction.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trxOuter] - Optional transaction object.
         * @param {function(trx: TeqFw_Db_Back_RDb_ITrans): Promise<*>} operation - The operation to execute. Receives the transaction as an argument.
         * @returns {Promise<*>}
         * @throws {Error}
         */
        this.execute = async function (trxOuter, operation) {
            if (!operation) throw new Error('Operation is required.');
            const trx = trxOuter ?? await conn.startTransaction();
            try {
                const result = await operation(trx);
                if (!trxOuter) await trx.commit();
                return result;
            } catch (error) {
                if (!trxOuter) await trx.rollback();
                throw error;
            }
        };
    }
}
