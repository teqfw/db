// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_History
 * @description Immutable effective-DEM history and schema-application trace contract.
 * @interface
 */

/** @interface */
export default class TeqFw_Db_Back_Api_RDb_History {
    /** @param {object} deps @returns {Promise<any>} */
    async recordSnapshot(deps) {}

    /** @param {object} deps @returns {Promise<any>} */
    async startApplication(deps) {}

    /** @param {object} deps @returns {Promise<any>} */
    async validateCatalog(deps) {}

    /** @param {object} deps @returns {Promise<any>} */
    async completeApplication(deps) {}

    /** @param {object} deps @returns {Promise<any>} */
    async failApplication(deps) {}

    /** @param {object} deps @returns {Promise<any>} */
    async resolveLastApplied(deps) {}
}
