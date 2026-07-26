// @ts-check

/**
 * @namespace TeqFw_Db_Back_Config
 * @description Stores application-root metadata and loads the legacy JSON configuration node used by database operations.
 */

export default class Config {
    constructor({fs, path, deep}) {
        let local = {};
        let projectRoot;
        let version;

        this.getLocal = function (node = null) {
            return node === null ? local : local?.[node] ?? null;
        };
        this.getPathToRoot = function () {
            return projectRoot;
        };
        this.getVersion = function () {
            return version;
        };
        this.init = function (root, appVersion) {
            projectRoot = root;
            version = appVersion;
            this.loadLocal(root);
        };
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
