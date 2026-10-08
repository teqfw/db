// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Compile_Graph
 * @description Immutable entity dependency graph produced by DEM compilation.
 */

const NS = 'TeqFw_Db_Back_Dto_Dem_Compile_Graph';

/**
 * Entity dependency graph.
 */
export default class Graph {
    /** @type {TeqFw_Db_GraphCycleArray} */
    cycles;
    /** @type {TeqFw_Db_GraphEdgeArray} */
    edges;
    /** @type {ReadonlyArray<string>} */
    entities;
    /** @type {ReadonlyArray<string>} */
    topological;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_GraphCycleArray} deps.cycles
     * @param {TeqFw_Db_GraphEdgeArray} deps.edges
     * @param {ReadonlyArray<string>} deps.entities
     * @param {ReadonlyArray<string>} deps.topological
     */
    constructor({cycles, edges, entities, topological}) {
        this.cycles = cycles.map((item) => ({...item}));
        this.edges = edges.map((item) => ({...item}));
        this.entities = [...entities];
        this.topological = [...topological];
    }
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
         * @param {TeqFw_Db_GraphCycleArray} deps.cycles
         * @param {TeqFw_Db_GraphEdgeArray} deps.edges
         * @param {TeqFw_Db_StringArray} deps.entities
         * @param {TeqFw_Db_StringArray} deps.topological
         * @returns {TeqFw_Db_Back_Dto_Dem_Compile_Graph}
         */
        this.create = function ({cycles, edges, entities, topological}) {
            const res = new Graph({cycles, edges, entities, topological});
            return freeze(res);
        };
    }
}

Object.freeze(Graph);
