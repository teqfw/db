// @ts-check

/**
 * @namespace TeqFw_Db_Back_App_TrxWrapper
 * @description TeqFW database package module.
 */

/**
 * Utility class for managing database operations with transaction support.
 * This class ensures that operations are executed within a transaction context,
 * either provided externally or created internally.
 */
export default class TeqFw_Db_Back_App_TrxWrapper {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Logger} deps.logger
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     */
    constructor({logger, conn}) {
        /**
         * Executes a database operation within an outer transaction or a newly created transaction.
         *
         * If provided, the operation runs within this transaction. Otherwise, a new transaction is created.
         * The operation to execute. It receives the transaction object as an argument.
         * Optional callback executed after a successful commit of the transaction.
         * Receives the result of the `operation` function.
         * Optional callback executed after a transaction rollback due to an error.
         * Receives the caught error as an argument.
         * @param {TeqFw_Db_Back_RDb_ITrans} trxOuter
         * @param {function(trx: TeqFw_Db_Back_RDb_ITrans): Promise<*>} operation
         * @param {function(*): void} onCommit
         * @param {function(Error): void} onRollback
         * @returns {Promise<*>}
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

export const __deps__ = Object.freeze({
    default: Object.freeze({
            logger: 'TeqFw_Db_Back_Logger$',
            conn: 'TeqFw_Db_Back_RDb_Connect$',
    }),
});
