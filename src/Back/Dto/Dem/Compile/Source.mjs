// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Compile_Source
 * @description Trusted source evidence for a canonical DEM node or diagnostic.
 */

const NS = 'TeqFw_Db_Back_Dto_Dem_Compile_Source';

/**
 * Trusted source evidence is created from scanner/runtime data, never declaration JSON.
 */
export default class Source {
    /** @type {string} */
    filename;
    /** @type {string} */
    fragmentId;
    /** @type {string} */
    packageName;
    /** @type {string} */
    revision;
    /** @type {string} */
    sourcePointer;

    /**
     * @param {object} deps
     * @param {string} deps.filename
     * @param {string} deps.fragmentId
     * @param {string} deps.packageName
     * @param {string} deps.revision
     * @param {string} deps.sourcePointer
     */
    constructor({filename, fragmentId, packageName, revision, sourcePointer}) {
        this.filename = filename;
        this.fragmentId = fragmentId;
        this.packageName = packageName;
        this.revision = revision;
        this.sourcePointer = sourcePointer;
    }
}

/**
 * @memberOf TeqFw_Db_Back_Dto_Dem_Compile_Source
 */
export class Factory {
    static namespace = NS;

    /**
     * Initialize the factory.
     */
    constructor() {
        /**
         * @param {object} deps
         * @param {string} deps.filename
         * @param {string} deps.fragmentId
         * @param {string} deps.packageName
         * @param {string} deps.sourcePointer
         * @param {string} [deps.revision]
         * @returns {TeqFw_Db_Back_Dto_Dem_Compile_Source}
         */
        this.create = function ({filename, fragmentId, packageName, revision = '', sourcePointer}) {
            const required = {filename, fragmentId, packageName};
            for (const [key, value] of Object.entries(required)) {
                if (typeof value !== 'string' || value.length === 0) {
                    throw new TypeError(`Trusted source field '${key}' must be a non-empty string.`);
                }
            }
            if (typeof sourcePointer !== 'string') {
                throw new TypeError("Trusted source field 'sourcePointer' must be a string.");
            }
            const res = new Source({
                filename, fragmentId, packageName, revision, sourcePointer,
            });
            return Object.freeze(res);
        };
    }
}

Object.freeze(Source);
