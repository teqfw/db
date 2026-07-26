// @ts-check

/**
 * @namespace TeqFw_Db_Back_App_Shutdown
 * @description Provides the lifecycle stop operation required by database CLI descriptors.
 */

export default class Shutdown {
    /**
     * @param {object} deps
     * @param {any} deps.connection
     */
    constructor({connection}) {
        /**
         * @returns {Promise<void>}
         */
        this.stop = async function () {
            await connection.disconnect();
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        connection: 'TeqFw_Db_Back_RDb_Connect$',
    }),
});
