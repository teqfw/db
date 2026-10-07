// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Util_Deep
 * @description Provides deterministic deep comparison, freezing, and merge operations used by model composition.
 */

export default class Deep {
    /**
     * Initialize the component.
     */
    constructor() {
        /**
         * @param {any} left
         * @param {any} right
         * @returns {any}
         */
        const equal = function (left, right) {
            if (left === right) return true;
            if (left === null || right === null || left === undefined || right === undefined) return false;
            if (typeof left !== 'object' || typeof right !== 'object') return false;
            const leftKeys = Object.keys(left);
            const rightKeys = Object.keys(right);
            if (leftKeys.length !== rightKeys.length) return false;
            return leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && equal(left[key], right[key]));
        };
        /**
         * @param {any} value
         * @returns {any}
         */
        const freeze = function (value) {
            for (const key of Reflect.ownKeys(value)) {
                const child = value[key];
                if ((child && typeof child === 'object') || typeof child === 'function') freeze(child);
            }
            return Object.freeze(value);
        };
        /**
         * @param {any} target
         * @param {any} source
         * @returns {any}
         */
        const merge = function (target, source) {
            /**
             * @param {any} value
             * @returns {any}
             */
            const isObject = (value) => value && typeof value === 'object';
            if (!isObject(target) || !isObject(source)) return source;
            for (const key of Object.keys(source)) {
                const current = Object.hasOwn(target, key) ? target[key] : undefined;
                const incoming = source[key];
                let value;
                if (Array.isArray(current) && Array.isArray(incoming))
                    value = current.concat(incoming);
                else if (isObject(current) && isObject(incoming))
                    value = merge(merge({}, current), incoming);
                else
                    value = incoming;
                Object.defineProperty(target, key, {configurable: true, enumerable: true, writable: true, value});
            }
            return target;
        };

        this.equal = equal;
        this.freeze = freeze;
        this.merge = merge;
    }
}
