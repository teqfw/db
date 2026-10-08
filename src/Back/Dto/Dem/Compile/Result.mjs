// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Compile_Result
 * @description Deeply immutable successful DEM compilation result.
 */

const NS = 'TeqFw_Db_Back_Dto_Dem_Compile_Result';

/**
 * Successful compilation value. Authenticity is held privately by the compiler.
 */
export default class Result {
    /** @type {TeqFw_Db_EffectiveModel} */
    effective;
    /** @type {string} */
    fingerprint;
    /** @type {TeqFw_Db_Graph} */
    graph;
    /** @type {TeqFw_Db_Model} */
    model;
    /** @type {TeqFw_Db_PhysicalPlan} */
    physical;
    /** @type {TeqFw_Db_Provenance} */
    provenance;
    /** @type {ReadonlyArray<string>} */
    requirements;
    /** @type {TeqFw_Db_DiagnosticArray} */
    warnings;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_EffectiveModel} deps.effective
     * @param {string} deps.fingerprint
     * @param {TeqFw_Db_Graph} deps.graph
     * @param {TeqFw_Db_Model} deps.model
     * @param {TeqFw_Db_PhysicalPlan} deps.physical
     * @param {TeqFw_Db_Provenance} deps.provenance
     * @param {ReadonlyArray<string>} deps.requirements
     * @param {TeqFw_Db_DiagnosticArray} deps.warnings
     */
    constructor({effective, fingerprint, graph, model, physical, provenance, requirements, warnings}) {
        this.effective = effective;
        this.fingerprint = fingerprint;
        this.graph = graph;
        this.model = model;
        this.physical = physical;
        this.provenance = provenance;
        this.requirements = [...requirements];
        this.warnings = [...warnings];
    }
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
         * @param {TeqFw_Db_EffectiveModel} deps.effective
         * @param {string} deps.fingerprint
         * @param {TeqFw_Db_Graph} deps.graph
         * @param {TeqFw_Db_Model} deps.model
         * @param {TeqFw_Db_PhysicalPlan} deps.physical
         * @param {TeqFw_Db_Provenance} deps.provenance
         * @param {ReadonlyArray<string>} deps.requirements
         * @param {TeqFw_Db_DiagnosticArray} deps.warnings
         * @returns {TeqFw_Db_Back_Dto_Dem_Compile_Result}
         */
        this.create = function ({effective, fingerprint, graph, model, physical, provenance, requirements, warnings}) {
            const res = new Result({
                effective, fingerprint, graph, model, physical, provenance, requirements, warnings,
            });
            return freeze(res);
        };
    }
}

Object.freeze(Result);
