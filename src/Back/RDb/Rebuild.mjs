// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Rebuild
 * @description Public unified rebuild facade delegating to the bounded evidence-producing executor.
 */

/** @implements TeqFw_Db_Back_Api_RDb_Rebuild */
export default class TeqFw_Db_Back_RDb_Rebuild {
    /** @param {object} deps @param {TeqFw_Db_Back_RDb_Rebuild_Execute} deps.execute */
    constructor({execute}) {
        this.exec = execute.exec;
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        execute: "TeqFw_Db_Back_RDb_Rebuild_Execute$",
    }),
});
