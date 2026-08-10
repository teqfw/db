/**
 * Initialize test environment to run unit or modules tests.
 * @namespace TestEnv
 */
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import Container from '@teqfw/di';

/**
 * @typedef {Object} TestEnv.Config.Path
 * @memberOf TestEnv.Config
 * @property {string} root path to the root folder of the plugin
 * @property {string} src path to the own sources of the plugin
 * @property {string} test path to the root folder of the tests for the plugin
 */

/**
 * @typedef {Object} TestEnv.Config
 * @property {TestEnv.Config.Path} path paths to various parts of the plugin files
 */

/**
 * Compose configuration object for test env.
 * @type {TestEnv.Config}
 */
const cfg = (function () {
    /* Resolve paths to main folders */
    const currentScript = fileURLToPath(import.meta.url);
    const pathScript = dirname(currentScript);
    const pathPrj = join(pathScript, '..');
    const pathTest = join(pathPrj, 'test');
    const srcOwn = join(pathPrj, 'src');
    return {
        path: {
            root: pathPrj,
            src: srcOwn,
            test: pathTest,
        }
    };
})();

/**
 * Create and setup DI container (once per all imports).
 * @type {TeqFw_Di_Container}
 */
const container = (function (cfg) {
    /** @type {TeqFw_Di_Container} */
    const res = new Container();
    const pathNode = join(cfg.path.root, 'node_modules');
    const srcTeqFwLog = join(pathNode, "@teqfw/log/src");
    const srcTeqFwCfg = join(pathNode, "@teqfw/cfg/src");
    // add backend sources to the map
    res.addNamespaceRoot("TeqFw_Db_", cfg.path.src, ".mjs");
    res.addNamespaceRoot("TeqFw_Cfg_", srcTeqFwCfg, ".mjs");
    res.addNamespaceRoot("TeqFw_Log_", srcTeqFwLog, ".mjs");
    return res;
})(cfg);

/**
 * Load local config.
 * @typedef {Object}
 */
const localCfg = await (async function (cfg, container) {
    // FUNCS
    /**
     * Default connection parameters to PostgreSQL/MariaDB/MuSQL database.
     * Override these params in the ignored project-root .env file.
     *
     * @returns {Object}
     */
    function generateDefault() {
        const connection = {
            'database': 'teqfw_db_test',
            'host': '127.0.0.1',
            'password': 'PasswordToConnectToTeqFWDb',
            'user': 'teqfw'
        };
        return {
            mariadb: {client: 'mysql2', connection},
            pg: {client: 'pg', connection}
        };
    }

    // MAIN
    const filename = join(cfg.path.root, '.env');
    const loader = await container.get('TeqFw_Cfg_Loader$');
    if (existsSync(filename)) {
        const dotenv = await container.get('TeqFw_Cfg_Source_DotenvFile$');
        await loader.load([dotenv.create({path: filename, id: 'db-test-dotenv'})]);
    } else {
        await loader.load([]);
    }
    const config = await container.get('TeqFw_Db_Back_Config$');
    const mariadb = config.get('mariadb');
    const pg = config.get('pg');
    return mariadb.connection && pg.connection ? {mariadb, pg} : generateDefault();
})(cfg, container);

/**
 * Use this function in tests to init DB connections.
 *
 * @returns {Promise<TeqFw_Db_Back_RDb_Connect>}
 */
const dbConnect = async function () {
    /** @type {TeqFw_Db_Back_RDb_Connect} */
    const conn = await container.get('TeqFw_Db_Back_RDb_Connect$'); // instance
    await conn.init({client: "sqlite3", connection: {filename: ":memory:"}, useNullAsDefault: true});
    // await conn.init(localCfg.pg);
    return conn;
};


/**
 * Setup development environment (if not set before) and return DI container.
 *
 * @returns {Promise<TeqFw_Di_Container>}
 */
export default async function () {
    return container;
}

export {
    cfg,
    container,
    dbConnect,
    localCfg,
};
