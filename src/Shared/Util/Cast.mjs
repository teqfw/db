// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Util_Cast
 * @description Converts untrusted DTO input to the primitive and collection shapes used by database declarations.
 */

const ENCODER = new TextEncoder();

export default class Cast {
    /**
     * Initialize the component.
     */
    constructor() {
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_ObjectArray}
         */
        this.array = function (data) {
            return Array.isArray(data) ? [...data] : [];
        };
        /**
         * @param {unknown} data
         * @param {any} factory
         * @returns {TeqFw_Db_ObjectArray}
         */
        this.arrayOfObj = function (data, factory) {
            const normalize = typeof factory === 'function' ? factory : (value) => value ?? {};
            return Array.isArray(data) ? data.map((item) => normalize(item)) : [];
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_StringArray}
         */
        this.arrayOfStr = function (data) {
            return Array.isArray(data) ? data.map((item) => this.string(item)) : [];
        };
        /**
         * @param {unknown} data
         * @returns {unknown}
         */
        this.bin = function (data) {
            if (typeof data === 'string') return ENCODER.encode(data);
            if (data instanceof Uint8Array) return new Uint8Array(data);
            return data;
        };
        /**
         * @param {unknown} data
         * @returns {boolean}
         */
        this.boolean = function (data) {
            return data === true
                || (typeof data === 'string' && ['true', 'yes'].includes(data.toLowerCase()))
                || (typeof data === 'number' && data !== 0);
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_BooleanNullable}
         */
        this.booleanIfExists = function (data) {
            return data === undefined || data === null ? data : this.boolean(data);
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_ObjectOptional}
         */
        this.date = function (data) {
            if (data instanceof Date) return new Date(data);
            if (typeof data === 'string' || typeof data === 'number') return new Date(data);
            return undefined;
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_NumberOptional}
         */
        this.decimal = function (data) {
            const result = Number.parseFloat(data);
            return Number.isNaN(result) ? undefined : result;
        };
        /**
         * @param {unknown} data
         * @param {object} values
         * @param {boolean} capitalize
         * @returns {unknown}
         */
        this.enum = function (data, values, capitalize = true) {
            const normalized = capitalize && typeof data === 'string' ? data.toUpperCase() : data;
            return Object.values(values).includes(normalized) ? normalized : undefined;
        };
        /**
         * @param {unknown} data
         * @returns {unknown}
         */
        this.function = function (data) {
            return typeof data === 'function' ? data : undefined;
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_NumberOptional}
         */
        this.int = function (data) {
            const normalized = typeof data === 'string' ? data.trim() : data;
            const result = Number.parseInt(normalized);
            return Number.isNaN(result) ? undefined : result;
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_Object}
         */
        this.object = function (data) {
            return typeof data === 'object' && data !== null ? JSON.parse(JSON.stringify(data)) : {};
        };
        /**
         * @param {unknown} data
         * @param {any} factory
         * @returns {TeqFw_Db_Object}
         */
        this.objectsMap = function (data, factory) {
            const normalize = typeof factory === 'function' ? factory : (value) => value ?? {};
            const result = {};
            if (typeof data === 'object' && data !== null)
                for (const key of Object.keys(data)) result[key] = normalize(data[key]);
            return result;
        };
        /**
         * @param {unknown} data
         * @returns {unknown}
         */
        this.primitive = function (data) {
            return data === null || ['string', 'number', 'boolean', 'symbol', 'bigint'].includes(typeof data)
                ? data
                : undefined;
        };
        /**
         * @param {unknown} data
         * @returns {TeqFw_Db_StringOptional}
         */
        this.string = function (data) {
            return ['string', 'number', 'boolean'].includes(typeof data) ? String(data) : undefined;
        };
    }
}
