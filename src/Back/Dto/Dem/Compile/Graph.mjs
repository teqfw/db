// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Compile_Graph
 * @description Immutable entity dependency graph produced by DEM compilation.
 */

const NS = 'TeqFw_Db_Back_Dto_Dem_Compile_Graph';

/**
 * Entity dependency graph.
 */
export default class TeqFw_Db_Back_Dto_Dem_Compile_Graph {
    /** @type {ReadonlyArray<object>} */
    cycles;
    /** @type {ReadonlyArray<object>} */
    edges;
    /** @type {ReadonlyArray<string>} */
    entities;
    /** @type {ReadonlyArray<string>} */
    topological;
}

/**
 * @memberOf TeqFw_Db_Back_Dto_Dem_Compile_Graph
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
         * @param {TeqFw_Db_ObjectArray} deps.cycles
         * @param {TeqFw_Db_ObjectArray} deps.edges
         * @param {TeqFw_Db_StringArray} deps.entities
         * @param {TeqFw_Db_StringArray} deps.topological
         * @returns {TeqFw_Db_Back_Dto_Dem_Compile_Graph}
         */
        this.create = function ({cycles, edges, entities, topological}) {
            const res = new TeqFw_Db_Back_Dto_Dem_Compile_Graph();
            res.cycles = cycles.map((item) => ({...item}));
            res.edges = edges.map((item) => ({...item}));
            res.entities = [...entities];
            res.topological = [...topological];
            return freeze(res);
        };
    }
}

Object.freeze(TeqFw_Db_Back_Dto_Dem_Compile_Graph);
