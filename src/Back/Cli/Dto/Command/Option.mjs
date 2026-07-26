// @ts-check

/**
 * @namespace TeqFw_Db_Back_Cli_Dto_Command_Option
 * @description Defines options attached to framework-neutral database CLI command descriptors.
 */

export default class Option {
    constructor() {
        this.defaultValue = undefined;
        this.description = undefined;
        this.flags = undefined;
        this.fn = undefined;
    }
}

export class Factory {
    constructor() {
        this.create = function (data = null) {
            const result = new Option();
            result.defaultValue = data?.defaultValue;
            result.description = data?.description === undefined ? undefined : String(data.description);
            result.flags = data?.flags === undefined ? undefined : String(data.flags);
            result.fn = typeof data?.fn === 'function' ? data.fn : undefined;
            return result;
        };
    }
}
