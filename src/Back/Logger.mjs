// @ts-check

/**
 * @namespace TeqFw_Db_Back_Logger
 * @description Adapts the TeqFW logging provider to the legacy database logging surface.
 */

export default class Logger {
    constructor({provider}) {
        const logger = provider.forSource('TeqFw_Db_Back_Logger');
        const errorData = (error, data) => error instanceof Error
            ? {err: error, ...(data && typeof data === 'object' ? data : {})}
            : data;

        this.info = function (message, data) {
            logger.info(String(message), data);
        };
        this.error = function (message, data) {
            logger.error(message instanceof Error ? message.message : String(message), errorData(message, data));
        };
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
