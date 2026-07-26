// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Util_Cast
 * @description Converts untrusted DTO input to the primitive and collection shapes used by database declarations.
 */

const ENCODER = new TextEncoder();

export default class Cast {
    constructor() {
        this.array = function (data) {
            return Array.isArray(data) ? [...data] : [];
        };
        this.arrayOfObj = function (data, factory) {
            const normalize = typeof factory === 'function' ? factory : (value) => value ?? {};
            return Array.isArray(data) ? data.map((item) => normalize(item)) : [];
        };
        this.arrayOfStr = function (data) {
            return Array.isArray(data) ? data.map((item) => this.string(item)) : [];
        };
        this.bin = function (data) {
            if (typeof data === 'string') return ENCODER.encode(data);
            if (data instanceof Uint8Array) return new Uint8Array(data);
            return data;
        };
        this.boolean = function (data) {
            return data === true
                || (typeof data === 'string' && ['true', 'yes'].includes(data.toLowerCase()))
                || (typeof data === 'number' && data !== 0);
        };
        this.booleanIfExists = function (data) {
            return data === undefined || data === null ? data : this.boolean(data);
        };
        this.date = function (data) {
            if (data instanceof Date) return new Date(data);
            if (typeof data === 'string' || typeof data === 'number') return new Date(data);
            return undefined;
        };
        this.decimal = function (data) {
            const result = Number.parseFloat(data);
            return Number.isNaN(result) ? undefined : result;
        };
        this.enum = function (data, values, capitalize = true) {
            const normalized = capitalize && typeof data === 'string' ? data.toUpperCase() : data;
            return Object.values(values).includes(normalized) ? normalized : undefined;
        };
        this.function = function (data) {
            return typeof data === 'function' ? data : undefined;
        };
        this.int = function (data) {
            const normalized = typeof data === 'string' ? data.trim() : data;
            const result = Number.parseInt(normalized);
            return Number.isNaN(result) ? undefined : result;
        };
        this.object = function (data) {
            return typeof data === 'object' && data !== null ? JSON.parse(JSON.stringify(data)) : {};
        };
        this.objectsMap = function (data, factory) {
            const normalize = typeof factory === 'function' ? factory : (value) => value ?? {};
            const result = {};
            if (typeof data === 'object' && data !== null)
                for (const key of Object.keys(data)) result[key] = normalize(data[key]);
            return result;
        };
        this.primitive = function (data) {
            return data === null || ['string', 'number', 'boolean', 'symbol', 'bigint'].includes(typeof data)
                ? data
                : undefined;
        };
        this.string = function (data) {
            return ['string', 'number', 'boolean'].includes(typeof data) ? String(data) : undefined;
        };
    }
}
