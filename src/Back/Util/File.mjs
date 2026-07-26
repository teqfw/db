// @ts-check

/**
 * @namespace TeqFw_Db_Back_Util_File
 * @description Reads database JSON assets and scans installed packages for declaration files.
 */

export default class File {
    constructor({fs, path}) {
        this.readJson = function (filename) {
            try {
                if (!fs.statSync(filename).isFile()) return null;
                return JSON.parse(fs.readFileSync(filename, 'utf8'));
            } catch (error) {
                if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return null;
                error.message = `${error.message} (file: ${filename})`;
                throw error;
            }
        };
        this.readPackageName = function (root) {
            const declared = this.readJson(path.join(root, "package.json"))?.name;
            if (declared) return declared;
            const parts = root.split(path.sep);
            const nodeModules = parts.lastIndexOf("node_modules");
            if (nodeModules < 0) return "app";
            return parts[nodeModules + 1]?.startsWith("@")
                ? parts.slice(nodeModules + 1, nodeModules + 3).join("/")
                : parts[nodeModules + 1];
        };
        this.scanNodeModules = function (root, filename) {
            const result = [];
            const pathNode = path.join(root, 'node_modules');
            const packagesRoot = fs.existsSync(pathNode) ? pathNode : root;
            for (const name of fs.readdirSync(packagesRoot)) {
                if (name.startsWith('@')) {
                    const scope = path.join(packagesRoot, name);
                    for (const packageName of fs.readdirSync(scope)) {
                        const candidate = path.join(scope, packageName, filename);
                        if (fs.existsSync(candidate)) result.push(candidate);
                    }
                } else {
                    const candidate = path.join(packagesRoot, name, filename);
                    if (fs.existsSync(candidate)) result.push(candidate);
                }
            }
            return result;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        fs: 'node:fs',
        path: 'node:path',
    }),
});
