// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema_A_Builder
 * @description Executes branded physical plans exclusively through the selected dialect adapter.
 */

export default class TeqFw_Db_Back_RDb_Schema_A_Builder {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Schema_A_Builder_Execute} deps.execute
     */
    constructor({execute}) {
        this.exec = execute.exec;
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        execute: 'TeqFw_Db_Back_RDb_Schema_A_Builder_Execute$',
    }),
});
