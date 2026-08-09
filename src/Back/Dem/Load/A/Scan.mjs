// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load_A_Scan
 * @description TeqFW database package module.
 */

/**
 * Load DEM fragments for all plugins (including application itself).
 */

/**
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Util_File} deps.file
     * @param {object} deps.pathUtil
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} deps._loadDem
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} deps._loadMap
     */
    constructor({file, pathUtil, _loadDem, _loadMap}) {
        /** @param {any} value @returns {any} */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };


        /**
         * Load DEM mapping data for the application and parse it.
         * @param {object} deps
         * @param {string} deps.path
         * @param {Object<string, string>} deps.testDems
         * @param {string} deps.testMapRoot
         * @returns {Promise<any>}
         */
        this.exec = async function ({path, testDems, testMapRoot}) {
            const DEM = pathUtil.join("etc", "teqfw.schema.json");
            const MAP = pathUtil.join("etc", "teqfw.schema.map.json");
            const fragments = [];
            // parse 'schema' JSON for the root plugin
            const pathBaseDem = pathUtil.join(path, DEM);
            const rootName = file.readPackageName(path);
            const rootDeclaration = await _loadDem.exec({filename: pathBaseDem});
            freeze(rootDeclaration);
            fragments.push(Object.freeze({
                declaration: rootDeclaration,
                filename: pathBaseDem,
                fragmentId: rootName,
                packageName: rootName,
            }));
            // parse 'schema' JSON for plugin in 'node_modules'
            /** @type {string[]} */
            const filenames = file.scanNodeModules(path, DEM);
            // add schema from test if available
            if (typeof testDems === 'object') {
                for (const key of Object.keys(testDems)) {
                    const testPath = testDems[key];
                    filenames.push(pathUtil.join(testPath, DEM));
                }
            }
            // load DEMs
            for (const filename of filenames) {
                const pathPlugin = filename.slice(0, -(pathUtil.sep + DEM).length);
                const testName = Object.entries(testDems ?? {}).find(([, testPath]) => testPath === pathPlugin)?.[0];
                const name = testName ?? file.readPackageName(pathPlugin);
                const declaration = await _loadDem.exec({filename});
                freeze(declaration);
                fragments.push(Object.freeze({declaration, filename, fragmentId: name, packageName: name}));
            }
            // load map file
            const pathMap = pathUtil.join(testMapRoot ?? path, MAP);
            const map = await _loadMap.exec({filename: pathMap});
            freeze(map);
            const mapEnvelope = Object.freeze({
                declaration: map,
                filename: pathMap,
                mapId: `${rootName}:map`,
                packageName: rootName,
            });
            fragments.sort((a, b) => a.fragmentId.localeCompare(b.fragmentId) || a.filename.localeCompare(b.filename));
            return {fragments: Object.freeze(fragments), map, mapEnvelope};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            file: "TeqFw_Db_Back_Util_File$",
            pathUtil: "node:path",
            _loadDem: 'TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$',
            _loadMap: 'TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$',
    }),
});
