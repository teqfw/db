// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_Dialect
 * @description Contract for immutable DEM physical projection, preflight, execution, and value codecs.
 * @interface
 */

/**
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_Dialect {
    /** @returns {any} */
    describe() {}
    /** @param {any} input @returns {any} */
    resolveType(input) {}
    /** @param {any} input @returns {any} */
    resolveDefault(input) {}
    /** @param {any} input @returns {any} */
    resolveGeneration(input) {}
    /** @param {any} input @returns {any} */
    resolveIndex(input) {}
    /** @param {any} input @returns {any} */
    resolveRelation(input) {}
    /** @param {any} input @returns {any} */
    resolveOperator(input) {}
    /** @param {any} input @returns {Promise<any>} */
    async preflight(input) {}
    /** @param {any} input @returns {any} */
    addColumn(input) {}
    /** @param {any} input @returns {any} */
    addConstraint(input) {}
    /** @param {any} input @returns {any} */
    addRelation(input) {}
    /** @param {any} input @returns {Promise<void>} */
    async addIndex(input) {}
    /** @param {any} input @returns {any} */
    dropRelation(input) {}
    /** @param {any} input @returns {any} */
    compileExpression(input) {}
    /** @param {any} input @returns {Promise<void>} */
    async applyExecutionOptions(input) {}
    /** @param {any} input @returns {Promise<any>} */
    async prepareTransfer(input) {}
    /** @param {any} input @returns {Promise<any>} */
    async restoreGeneratedState(input) {}
    /** @param {any} input @returns {any} */
    encodeValue(input) {}
    /** @param {any} input @returns {any} */
    decodeValue(input) {}
}
