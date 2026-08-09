// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_Fingerprint
 * @description Canonically serializes and fingerprints a successful DEM target.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_Fingerprint {
    /**
     * @param {object} deps
     * @param {Function} deps.createHash
     */
    constructor({createHash}) {
        /**
         * @param {any} value
         * @returns {any}
         */
        const normalize = function (value) {
            if (Array.isArray(value)) return value.map(normalize);
            if (value && typeof value === 'object') {
                const res = {};
                for (const key of Object.keys(value).sort()) res[key] = normalize(value[key]);
                return res;
            }
            return value;
        };

        /**
         * @param {object} deps
         * @param {any} deps.value
         * @returns {string}
         */
        this.exec = function ({value}) {
            const json = JSON.stringify(normalize(value));
            return `sha256-v1:${createHash('sha256').update(json).digest('hex')}`;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        createHash: 'node:crypto__createHash',
    }),
});
