import {configDto, dbConnect as dbConnectFw, RDBMS} from '@teqfw/test';
import {join} from 'node:path';
import {existsSync} from 'node:fs';

// import 'dotenv/config';

/**
 * @param {TeqFw_Di_Container} container
 * @return {Promise<void>}
 */
export async function dbConnect(container) {
    /** @type {TeqFw_Db_Back_RDb_Connect} */
    const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
    // Set up DB connection for the Object Container
    await dbConnectFw(RDBMS.SQLITE_BETTER, conn);
}

/**
 * @param {TeqFw_Di_Container} container
 * @return {Promise<void>}
 */
export async function dbDisconnect(container) {
    try {
        /** @type {TeqFw_Db_Back_RDb_Connect} */
        const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
        await conn.disconnect();
    } catch (e) {
        debugger
    }
}

/**
 * @param {TeqFw_Di_Container} container
 * @return {Promise<{user: {id: undefined}}>}
 */
export async function dbCreateFkEntities(container) {
    const user = {id: undefined};

    /** @type {TeqFw_Core_Shared_Api_Logger} */
    const logger = await container.get('TeqFw_Core_Shared_Api_Logger$$');
    /** @type {TeqFw_Db_Back_RDb_Connect} */
    const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
    /** @type {TeqFw_Db_Back_Api_RDb_CrudEngine} */
    const crud = await container.get('TeqFw_Db_Back_Api_RDb_CrudEngine$');

    // Create an app user
    await dbConnect(container);
    const trx = await conn.startTransaction();
    try {
        const rdbBase = {
            getAttributes: () => ({ID: 'id'}),
            getEntityName: () => '/user',
            getPrimaryKey: () => ['id'],
        };
        const {id} = await crud.create(trx, rdbBase, {id: undefined});
        await trx.commit();
        user.id = id;
    } catch (e) {
        await trx.rollback();
        logger.exception(e);
    }
    await dbDisconnect(container);
    return {user};
}

/**
 * @param {TeqFw_Di_Container} container
 * @return {Promise<void>}
 */
export async function dbReset(container) {
    // FUNCS
    /**
     * Get the path to the test data directory.
     * @param {string} root - The root path of the project.
     * @returns {string} The resolved path to the test data directory.
     */
    function getTestDataPath(root) {
        const pathInNodeModules = join(root, 'node_modules', '@teqfw', 'db', 'test', 'data');
        const pathInRoot = join(root, 'test', 'data');

        return existsSync(pathInNodeModules) ? pathInNodeModules : pathInRoot;
    }

    // MAIN
    try {
        /** @type {TeqFw_Core_Back_Config} */
        const config = await container.get('TeqFw_Core_Back_Config$');
        // Initialize database structure using test DEM

        /** @type {{action: TeqFw_Db_Back_Cli_Init.action}} */
        const {action} = await container.get('TeqFw_Db_Back_Cli_Init$');
        const testDems = {
            test: getTestDataPath(config.getPathToRoot()),
        };
        await dbConnect(container);
        await action({testDems});
        await dbDisconnect(container);
    } catch (e) {
        debugger
    }
}

/**
 * @param {TeqFw_Di_Container} container
 * @return {Promise<void>}
 */
export async function initConfig(container) {
    // Initialize environment configuration
    /** @type {TeqFw_Core_Back_Config} */
    const config = await container.get('TeqFw_Core_Back_Config$');
    config.init(configDto.pathToRoot, '0.0.0');

    // Set up console transport for the logger
    /** @type {TeqFw_Core_Shared_Logger_Base} */
    const base = await container.get('TeqFw_Core_Shared_Logger_Base$');
    /** @type {TeqFw_Core_Shared_Api_Logger_Transport} */
    const transport = await container.get('TeqFw_Core_Shared_Api_Logger_Transport$');
    base.setTransport(transport);
}
