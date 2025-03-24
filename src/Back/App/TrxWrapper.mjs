/**
 * Utility class for managing database operations with transaction support.
 * This class ensures that operations are executed within a transaction context,
 * either provided externally or created internally.
 */
export default class TeqFw_Db_Back_App_TrxWrapper {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
     * @param {TeqFw_Db_Back_RDb_IConnect} conn - Database connection interface.
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_RDb_IConnect$: conn,
        }
    ) {
        /**
         * Executes a database operation within an outer transaction or a newly created transaction.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trxOuter] - Optional transaction object.
         *        If provided, the operation runs within this transaction. Otherwise, a new transaction is created.
         * @param {function(trx: TeqFw_Db_Back_RDb_ITrans): Promise<*>} operation -
         *        The operation to execute. It receives the transaction object as an argument.
         * @param {function(*): void} [onCommit] -
         *        Optional callback executed after a successful commit of the transaction.
         *        Receives the result of the `operation` function.
         * @param {function(Error): void} [onRollback] -
         *        Optional callback executed after a transaction rollback due to an error.
         *        Receives the caught error as an argument.
         * @returns {Promise<*>} - Resolves with the result of the `operation` function.
         * @throws {Error} - Propagates any errors thrown during transaction execution.
         */
        this.execute = async function (trxOuter, operation, onCommit, onRollback) {
            if (typeof operation !== 'function') {
                throw new TypeError('Operation must be a function.');
            }

            const trx = trxOuter ?? await conn.startTransaction();
            try {
                const result = await operation(trx);
                if (!trxOuter) {
                    await trx.commit();
                    onCommit?.(result);
                }
                return result;
            } catch (error) {
                if (!trxOuter) {
                    try {
                        await trx.rollback();
                    } catch (rollbackError) {
                        logger.error('Rollback failed:', rollbackError);
                    }
                    try {
                        onRollback?.(error);
                    } catch (rollbackError) {
                        logger.error('Error in rollback callback:', rollbackError);
                    }
                }
                throw error;
            }
        };
    }
}
