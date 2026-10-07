// @ts-check

/**
 * @namespace TeqFw_Db_Back_Cli_Dto_Command
 * @description Defines the framework-neutral command descriptor returned by database CLI modules.
 */

export default class Command {
    /**
     * Initialize the component.
     */
    constructor() {
        /** @type {unknown} */
        this.action = undefined;
        /** @type {unknown[]} */
        this.args = [];
        /** @type {TeqFw_Db_StringOptional} */
        this.desc = undefined;
        /** @type {TeqFw_Db_StringOptional} */
        this.name = undefined;
        /** @type {unknown[]} */
        this.opts = [];
        /** @type {TeqFw_Db_StringOptional} */
        this.realm = undefined;
    }
}

export class Factory {
    /**
     * Initialize the component.
     */
    constructor() {
        /**
         * @param {any} data
         * @returns {any}
         */
        this.create = function (data = null) {
            const result = new Command();
            result.action = typeof data?.action === 'function' ? data.action : undefined;
            result.args = Array.isArray(data?.args) ? [...data.args] : [];
            result.desc = data?.desc === undefined ? undefined : String(data.desc);
            result.name = data?.name === undefined ? undefined : String(data.name);
            result.opts = Array.isArray(data?.opts) ? [...data.opts] : [];
            result.realm = data?.realm === undefined ? undefined : String(data.realm);
            return result;
        };
    }
}
