// @ts-check

/**
 * @namespace TeqFw_Db_Back_Config
 * @description Builds default and named Knex configurations from the shared cfg snapshot.
 */

const CFG_NAMESPACE = 'TEQFW_DB';
const PACKAGE_NAME = '@teqfw/db';
const DEFAULT_CONNECTION = 'default';

export default class Config {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Deep} deps.deep
     * @param {TeqFw_Cfg_Reader} deps.reader
     */
    constructor({deep, reader}) {
        /** @type {Map<string, any>} */
        const configurations = new Map();
        let projectRoot;
        let version;

        /**
         * @param {string} name
         * @returns {string}
         */
        function normalizeName(name) {
            if (typeof name === 'string' && name.toLowerCase() === DEFAULT_CONNECTION) return DEFAULT_CONNECTION;
            if (typeof name !== 'string' || !/^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/i.test(name))
                throw new TypeError('A connection name must contain alphanumeric segments separated by hyphens or underscores.');
            return name.replaceAll('-', '_').toLowerCase();
        }

        /**
         * @param {string} name
         * @param {string} parameter
         * @returns {string}
         */
        function parameter(name, parameter) {
            const prefix = name === DEFAULT_CONNECTION ? '' : `${name.toUpperCase()}_`;
            return `${prefix}${parameter}`;
        }

        /**
         * @param {unknown} value
         * @param {string} key
         * @returns {any}
         */
        function object(value, key) {
            let result = value;
            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch {
                    throw new TypeError(`${CFG_NAMESPACE}__${key} must contain valid JSON.`);
                }
            }
            if (!result || typeof result !== 'object' || Array.isArray(result))
                throw new TypeError(`${CFG_NAMESPACE}__${key} must be an object.`);
            return result;
        }

        /**
         * @param {unknown} value
         * @param {string} key
         * @returns {any}
         */
        function boolean(value, key) {
            if (value === undefined) return undefined;
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number' && (value === 0 || value === 1)) return value === 1;
            if (typeof value === 'string') {
                const normalized = value.trim().toLowerCase();
                if (['1', 'true', 'yes'].includes(normalized)) return true;
                if (['0', 'false', 'no'].includes(normalized)) return false;
            }
            throw new TypeError(`${CFG_NAMESPACE}__${key} must be a boolean value.`);
        }

        /**
         * @param {unknown} value
         * @param {string} key
         * @returns {any}
         */
        function port(value, key) {
            if (value === undefined) return undefined;
            const result = typeof value === 'number' ? value : Number(value);
            if (!Number.isInteger(result) || result < 1 || result > 65535)
                throw new TypeError(`${CFG_NAMESPACE}__${key} must be an integer from 1 to 65535.`);
            return result;
        }

        /**
         * @param {unknown} value
         * @param {string} key
         * @returns {any}
         */
        function searchPath(value, key) {
            if (value === undefined) return undefined;
            const result = Array.isArray(value) ? value : String(value).split(',').map((item) => item.trim());
            if (!result.length || !result.every((item) => typeof item === 'string' && item.length > 0))
                throw new TypeError(`${CFG_NAMESPACE}__${key} must be a comma-separated list or an array of strings.`);
            return result;
        }

        /**
         * @param {string} name
         * @returns {any}
         */
        this.get = function (name = DEFAULT_CONNECTION) {
            name = normalizeName(name);
            const cached = configurations.get(name);
            if (cached) return cached;

            const raw = reader.get(CFG_NAMESPACE);
            /**
             * @param {string} suffix
             * @returns {string}
             */
            const key = (suffix) => parameter(name, suffix);
            const extraKey = key('EXTRA');
            const extra = raw[extraKey] === undefined ? {} : object(raw[extraKey], extraKey);
            const result = {...extra};
            const extraConnection = extra.connection === undefined ? {} : object(extra.connection, extraKey);
            const connection = {...extraConnection};

            const connectionFields = {
                database: raw[key('DATABASE')],
                filename: raw[key('FILENAME')],
                host: raw[key('HOST')],
                password: raw[key('PASSWORD')],
                port: port(raw[key('PORT')], key('PORT')),
                socketPath: raw[key('SOCKET_PATH')],
                user: raw[key('USER')],
            };
            for (const [field, value] of Object.entries(connectionFields))
                if (value !== undefined) connection[field] = value;

            if (Object.keys(connection).length) result.connection = connection;
            else delete result.connection;
            if (raw[key('CLIENT')] !== undefined) result.client = String(raw[key('CLIENT')]);
            const useNullAsDefault = boolean(raw[key('USE_NULL_AS_DEFAULT')], key('USE_NULL_AS_DEFAULT'));
            if (useNullAsDefault !== undefined) result.useNullAsDefault = useNullAsDefault;
            const paths = searchPath(raw[key('SEARCH_PATH')], key('SEARCH_PATH'));
            if (paths !== undefined) result.searchPath = paths;
            if (raw[key('VERSION')] !== undefined) result.version = String(raw[key('VERSION')]);

            const complete = deep.freeze(result);
            configurations.set(name, complete);
            return complete;
        };

        /**
         * Compatibility projection for legacy package consumers.
         * @param {any} node
         * @returns {any}
         */
        this.getLocal = function (node = null) {
            if (node === null) return deep.freeze({[PACKAGE_NAME]: this.get()});
            return node === PACKAGE_NAME ? this.get() : null;
        };

        /** @returns {any} */
        this.getPathToRoot = function () {
            return projectRoot;
        };

        /** @returns {any} */
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
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        deep: 'TeqFw_Db_Shared_Util_Deep$',
        reader: 'TeqFw_Cfg_Reader$',
    }),
});
