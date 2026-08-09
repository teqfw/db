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
    /** @returns {object} */
    describe() {}
    /** @param {object} input @returns {object} */
    resolveType(input) {}
    /** @param {object} input @returns {object} */
    resolveDefault(input) {}
    /** @param {object} input @returns {object} */
    resolveGeneration(input) {}
    /** @param {object} input @returns {object} */
    resolveIndex(input) {}
    /** @param {object} input @returns {object} */
    resolveRelation(input) {}
    /** @param {object} input @returns {object} */
    resolveOperator(input) {}
    /** @param {object} input @returns {Promise<object>} */
    async preflight(input) {}
    /** @param {object} input @returns {any} */
    addColumn(input) {}
    /** @param {object} input @returns {any} */
    addConstraint(input) {}
    /** @param {object} input @returns {any} */
    addRelation(input) {}
    /** @param {object} input @returns {Promise<void>} */
    async addIndex(input) {}
    /** @param {object} input @returns {any} */
    dropRelation(input) {}
    /** @param {object} input @returns {any} */
    compileExpression(input) {}
    /** @param {object} input @returns {Promise<void>} */
    async applyExecutionOptions(input) {}
    /** @param {object} input @returns {Promise<object>} */
    async prepareTransfer(input) {}
    /** @param {object} input @returns {Promise<any>} */
    async restoreGeneratedState(input) {}
    /** @param {object} input @returns {any} */
    encodeValue(input) {}
    /** @param {object} input @returns {any} */
    decodeValue(input) {}
}
