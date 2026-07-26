// @ts-check

/**
 * @namespace TeqFw_Db_Back_Logger
 * @description Adapts the TeqFW logging provider to the legacy database logging surface.
 */

export default class Logger {
    /**
     * @param {object} deps
     * @param {any} deps.provider
     */
    constructor({provider}) {
        const logger = provider.forSource('TeqFw_Db_Back_Logger');
        /**
         * @param {any} error
         * @param {any} data
         * @returns {any}
         */
        const errorData = (error, data) => error instanceof Error
            ? {err: error, ...(data && typeof data === 'object' ? data : {})}
            : data;

        /**
         * @param {any} message
         * @param {any} data
         */
        this.info = function (message, data) {
            logger.info(String(message), data);
        };
        /**
         * @param {any} message
         * @param {any} data
         */
        this.error = function (message, data) {
            logger.error(message instanceof Error ? message.message : String(message), errorData(message, data));
        };
        /**
         * @param {any} error
         */
        this.exception = function (error) {
            logger.error(error instanceof Error ? error.message : String(error), {err: error});
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        provider: 'TeqFw_Log_Provider$',
    }),
});
