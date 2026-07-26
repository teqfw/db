// @ts-check

/**
 * @namespace TeqFw_Db_Back_Plugin_Stop
 * @description TeqFW database package module.
 */

/**
 * Plugin finalization function.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Plugin_Stop';
/**
 * @param {TeqFw_Db_Back_RDb_IConnect} connect
 */

export default function Factory({connect}) {
    // COMPOSE RESULT
    async function exec() {
        // web-plugin works with DB, so we need to disconnect from RDBMS
        await connect.disconnect();
    }

    Object.defineProperty(exec, 'namespace', {value: NS});
    return exec;
}

// finalize code components for this es6-module
Object.defineProperty(Factory, 'namespace', {value: NS});

export const __deps__ = Object.freeze({
    default: Object.freeze({
            connect: 'TeqFw_Db_Back_RDb_Connect$',
    }),
});
