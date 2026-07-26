// @ts-check

/**
 * @namespace TeqFw_Db_Back_Plugin_Init
 * @description TeqFW database package module.
 */

/**
 * Plugin initialization function.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Plugin_Init';

/**
 * @param {object} deps
 * @param {TeqFw_Db_Back_Defaults} deps.DEF
 * @param {TeqFw_Db_Back_Config} deps.config
 * @param {TeqFw_Db_Back_RDb_Connect} deps.conn
 * @returns {any}
 */
export default function Factory({DEF, config, conn}) {
    // FUNCS
    /**
     * @returns {Promise<void>}
     */
    async function action() {
        // RDB connection
        /** @type {TeqFw_Db_Back_Dto_Config_Local} */
        const cfg = config.getLocal(DEF.NAME);
        if (cfg?.connection)
            await conn.init(cfg);
    }

    // MAIN
    Object.defineProperty(action, 'namespace', {value: NS});
    return action;
}

// finalize code components for this es6-module
Object.defineProperty(Factory, 'namespace', {value: NS});

export const __deps__ = Object.freeze({
    default: Object.freeze({
            DEF: 'TeqFw_Db_Back_Defaults$',
            config: 'TeqFw_Db_Back_Config$',
            conn: 'TeqFw_Db_Back_RDb_Connect$',
    }),
});
