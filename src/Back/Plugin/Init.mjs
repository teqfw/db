/**
 * Plugin initialization function.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Plugin_Init';

/**
 * @param {TeqFw_Db_Back_Defaults} DEF
 * @param {TeqFw_Core_Back_Config} config
 * @param {TeqFw_Db_Back_RDb_Connect} conn -  use interface as implementation
 */
export default function Factory(
    {
        TeqFw_Db_Back_Defaults$: DEF,
        TeqFw_Core_Back_Config$: config,
        TeqFw_Db_Back_RDb_IConnect$: conn,
    }) {
    // FUNCS
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
