// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Compile_Result
 * @description Deeply immutable successful DEM compilation result.
 */

const NS = 'TeqFw_Db_Back_Dto_Dem_Compile_Result';

/**
 * Successful compilation value. Authenticity is held privately by the compiler.
 */
export default class TeqFw_Db_Back_Dto_Dem_Compile_Result {
    /** @type {string} */
    fingerprint;
    /** @type {object} */
    graph;
    /** @type {object} */
    model;
    /** @type {object} */
    physical;
    /** @type {object} */
    provenance;
    /** @type {ReadonlyArray<string>} */
    requirements;
    /** @type {ReadonlyArray<object>} */
    warnings;
}

/**
 * @memberOf TeqFw_Db_Back_Dto_Dem_Compile_Result
 */
export class Factory {
    static namespace = NS;

    /**
     * Initialize the factory.
     */
    constructor() {
        /**
         * @param {any} value
         * @returns {any}
         */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        /**
         * @param {object} deps
         * @param {string} deps.fingerprint
         * @param {object} deps.graph
         * @param {object} deps.model
         * @param {object} deps.physical
         * @param {object} deps.provenance
         * @param {ReadonlyArray<string>} deps.requirements
         * @param {ReadonlyArray<object>} deps.warnings
         * @returns {Readonly<TeqFw_Db_Back_Dto_Dem_Compile_Result>}
         */
        this.create = function ({fingerprint, graph, model, physical, provenance, requirements, warnings}) {
            const res = new TeqFw_Db_Back_Dto_Dem_Compile_Result();
            res.fingerprint = fingerprint;
            res.graph = graph;
            res.model = model;
            res.physical = physical;
            res.provenance = provenance;
            res.requirements = [...requirements];
            res.warnings = [...warnings];
            return freeze(res);
        };
    }
}

Object.freeze(TeqFw_Db_Back_Dto_Dem_Compile_Result);
