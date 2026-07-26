// @ts-check

/**
 * @namespace TeqFw_Db_Back_Config
 * @description Stores application-root metadata and loads the legacy JSON configuration node used by database operations.
 */

export default class Config {
    /**
     * @param {object} deps
     * @param {any} deps.fs
     * @param {any} deps.path
     * @param {any} deps.deep
     */
    constructor({fs, path, deep}) {
        let local = {};
        let projectRoot;
        let version;

        /**
         * @param {any} node
         * @returns {any}
         */
        this.getLocal = function (node = null) {
            return node === null ? local : local?.[node] ?? null;
        };
        /**
         * @returns {any}
         */
        this.getPathToRoot = function () {
            return projectRoot;
        };
        /**
         * @returns {any}
         */
        this.getVersion = function () {
            return version;
        };
        /**
         * @param {any} root
         * @param {any} appVersion
         */
        this.init = function (root, appVersion) {
            projectRoot = root;
            version = appVersion;
            this.loadLocal(root);
        };
        /**
         * @param {any} root
         * @param {any} relative
         */
        this.loadLocal = function (root, relative = './cfg/local.json') {
            projectRoot = root;
            const filename = path.join(root, relative);
            if (fs.existsSync(filename) && fs.statSync(filename).isFile())
                local = JSON.parse(fs.readFileSync(filename, 'utf8'));
            else
                local = {};
            deep.freeze(local);
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        fs: 'node:fs',
        path: 'node:path',
        deep: "TeqFw_Db_Shared_Util_Deep$",
    }),
});
