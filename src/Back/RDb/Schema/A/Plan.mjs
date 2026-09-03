// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema_A_Plan
 * @description Builds immutable operation phases only from an authentic successful compilation result.
 */

export default class TeqFw_Db_Back_RDb_Schema_A_Plan {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
     * @param {TeqFw_Db_Back_RDb_Dialect_Registry} deps.dialects
     * @param {TeqFw_Db_Back_RDb_Schema_A_DropOrder} deps.dropOrder
     */
    constructor({compile, dialects, dropOrder}) {
        /**
         * @param {any} value
         * @returns {any}
         */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };
        const authentic = new WeakSet();
        /** @param {any} value @returns {any} */
        const finalize = function (value) {
            const result = freeze(value);
            authentic.add(result);
            return result;
        };

        /** @param {object} deps @param {object} deps.value @returns {any} */
        this.assertPlan = function ({value}) {
            if (!value || typeof value !== 'object' || !authentic.has(value)) {
                throw new TypeError('An authentic schema plan is required.');
            }
            return value;
        };


        /**
         * @param {object} deps
         * @param {object} deps.compilation
         * @param {object} deps.operation
         * @param {boolean} deps.includeData
         * @param {object} deps.cycleStrategy
         * @returns {any}
         */
        this.exec = function ({compilation, operation = 'create', includeData = false, cycleStrategy = null}) {
            compile.assertResult({value: compilation});
            if (!['create', 'drop', 'rebuild', 'transfer'].includes(operation)) {
                throw new TypeError(`Unsupported schema plan operation '${operation}'.`);
            }
            const physical = compilation.physical;
            const tableByEntity = Object.fromEntries(physical.tables.map((table) => [table.entity, table]));
            const order = compilation.graph.topological;
            const orderedTables = order.map((entity) => tableByEntity[entity]).filter(Boolean);
            const tableRank = Object.fromEntries(order.map((entity, index) => [entity, index]));
            /** @param {any} left @param {any} right @returns {number} */
            const sortOperations = function (left, right) {
                return (tableRank[left.entity] ?? Number.MAX_SAFE_INTEGER) - (tableRank[right.entity] ?? Number.MAX_SAFE_INTEGER)
                    || String(left.name).localeCompare(String(right.name));
            };
            const indexesByEntity = {};
            for (const index of physical.phases.tables) {
                (indexesByEntity[index.entity] ??= []).push(index);
            }
            for (const indexes of Object.values(indexesByEntity)) indexes.sort(sortOperations);

            const cycleOperation = operation === 'transfer' || operation === 'rebuild';
            let cycleRequirements = [];
            if (cycleOperation && compilation.graph.cycles.length > 0) {
                const adapter = dialects.getById({id: physical.adapter});
                const validation = adapter.validateCycleStrategy({cycles: compilation.graph.cycles, strategy: cycleStrategy});
                if (!validation.valid) {
                    const error = new Error('Cyclic data transfer requires an explicit adapter-validated strategy.');
                    error.name = 'DemPlanError';
                    Object.defineProperty(error, 'diagnostics', {
                        enumerable: true,
                        value: Object.freeze([Object.freeze({
                            code: 'DEM_DEPENDENCY_CYCLE_UNPLANNED',
                            details: {cycles: compilation.graph.cycles.map((item) => item.entities), strategy: cycleStrategy?.id},
                            message: error.message,
                            path: '',
                            severity: 'error',
                            sources: Object.freeze(compilation.graph.cycles.flatMap((item) => item.relations.flatMap((rel) => rel.sources))),
                            stage: 'plan',
                        })]),
                    });
                    throw Object.freeze(error);
                }
                cycleRequirements = validation.requirements ?? [];
            }

            const preflight = {
                fingerprint: compilation.fingerprint,
                operation,
                requirements: [...new Set([...physical.phases.preflight.requirements, ...cycleRequirements])].sort(),
            };
            if (operation === 'drop') {
                const tables = dropOrder.exec({compilation});
                return finalize({
                    adapter: physical.adapter,
                    fingerprint: compilation.fingerprint,
                    operation,
                    phases: {
                        preflight,
                        relations: [...physical.phases.relations].sort(sortOperations).reverse(),
                        tables,
                        verification: [
                            ...tables.map((table) => ({kind: 'tableAbsent', name: table.name})),
                            ...physical.phases.verification,
                        ],
                    },
                });
            }

            return finalize({
                adapter: physical.adapter,
                fingerprint: compilation.fingerprint,
                operation,
                phases: {
                    preflight,
                    tables: orderedTables.map((table) => ({
                        constraints: [...(indexesByEntity[table.entity] ?? [])],
                        table,
                    })),
                    relations: [...physical.phases.relations].sort(sortOperations),
                    afterRelations: [...physical.phases.afterRelations].sort(sortOperations),
                    data: includeData ? [...physical.phases.data] : [],
                    afterData: [...physical.phases.afterData].sort(sortOperations),
                    verification: [
                        ...orderedTables.map((table) => ({kind: 'tableExists', name: table.name})),
                        ...physical.phases.verification,
                    ],
                },
            });
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        compile: 'TeqFw_Db_Back_Dem_Compile$',
        dialects: 'TeqFw_Db_Back_RDb_Dialect_Registry$',
        dropOrder: 'TeqFw_Db_Back_RDb_Schema_A_DropOrder$',
    }),
});
