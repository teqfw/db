// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema_A_DropOrder
 * @description Produces deterministic dependency-safe drop ordering for active and explicitly deprecated entities.
 */

export default class TeqFw_Db_Back_RDb_Schema_A_DropOrder {
    /** Initialize deterministic drop ordering. */
    constructor() {
        /**
         * @param {object} deps
         * @param {object} deps.compilation
         * @returns {ReadonlyArray<object>}
         */
        this.exec = function ({compilation}) {
            const physical = compilation.physical;
            const active = new Set(compilation.graph.entities);
            const deprecated = new Set(Object.keys(compilation.model.deprecated ?? {}).filter((path) => !active.has(path)));
            const entities = [...active, ...deprecated].sort();
            const entitySet = new Set(entities);
            const adjacency = Object.fromEntries(entities.map((path) => [path, []]));

            for (const edge of compilation.graph.edges) {
                if (entitySet.has(edge.from) && entitySet.has(edge.to)) adjacency[edge.from].push(edge.to);
            }
            for (const path of [...deprecated].sort()) {
                for (const dependency of compilation.model.deprecated[path] ?? []) {
                    if (!entitySet.has(dependency)) {
                        const error = new Error(`Deprecated entity '${path}' names unknown drop dependency '${dependency}'.`);
                        error.name = 'DemPlanError';
                        Object.defineProperty(error, 'diagnostics', {
                            enumerable: true,
                            value: Object.freeze([Object.freeze({
                                code: 'DEM_REFERENCE_ENTITY_MISSING',
                                details: {dependency, entity: path},
                                message: error.message,
                                path: `/deprecated/${path.replaceAll('~', '~0').replaceAll('/', '~1')}`,
                                severity: 'error',
                                sources: Object.freeze(compilation.provenance[`/deprecated/${path.replaceAll('~', '~0').replaceAll('/', '~1')}`] ?? []),
                                stage: 'plan',
                            })]),
                        });
                        throw Object.freeze(error);
                    }
                    adjacency[path].push(dependency);
                }
            }
            for (const path of entities) adjacency[path] = [...new Set(adjacency[path])].sort();

            let nextIndex = 0;
            const indexByEntity = {};
            const lowByEntity = {};
            const onStack = new Set();
            const stack = [];
            const components = [];
            /** @param {string} entity */
            const visit = function (entity) {
                indexByEntity[entity] = nextIndex;
                lowByEntity[entity] = nextIndex;
                nextIndex++;
                stack.push(entity);
                onStack.add(entity);
                for (const dependency of adjacency[entity]) {
                    if (indexByEntity[dependency] === undefined) {
                        visit(dependency);
                        lowByEntity[entity] = Math.min(lowByEntity[entity], lowByEntity[dependency]);
                    } else if (onStack.has(dependency)) {
                        lowByEntity[entity] = Math.min(lowByEntity[entity], indexByEntity[dependency]);
                    }
                }
                if (lowByEntity[entity] !== indexByEntity[entity]) return;
                const component = [];
                let current;
                do {
                    current = stack.pop();
                    onStack.delete(current);
                    component.push(current);
                } while (current !== entity);
                component.sort();
                components.push(component);
            };
            for (const entity of entities) if (indexByEntity[entity] === undefined) visit(entity);
            components.sort((left, right) => left[0].localeCompare(right[0]));

            const unsafeCycle = components.find((component) => {
                const selfLoop = component.length === 1 && adjacency[component[0]].includes(component[0]);
                return (component.length > 1 || selfLoop) && component.some((path) => deprecated.has(path));
            });
            if (unsafeCycle) {
                const error = new Error('Deprecated table dependencies contain a cycle that cannot be dropped safely.');
                error.name = 'DemPlanError';
                Object.defineProperty(error, 'diagnostics', {
                    enumerable: true,
                    value: Object.freeze([Object.freeze({
                        code: 'DEM_DEPENDENCY_CYCLE_UNPLANNED',
                        details: {entities: unsafeCycle},
                        message: error.message,
                        path: '/deprecated',
                        severity: 'error',
                        sources: Object.freeze(unsafeCycle.flatMap((path) => compilation.provenance[`/deprecated/${path.replaceAll('~', '~0').replaceAll('/', '~1')}`] ?? [])),
                        stage: 'plan',
                    })]),
                });
                throw Object.freeze(error);
            }

            const componentByEntity = {};
            components.forEach((component, index) => component.forEach((entity) => componentByEntity[entity] = index));
            const dependencies = components.map(() => new Set());
            for (const entity of entities) {
                const from = componentByEntity[entity];
                for (const dependency of adjacency[entity]) {
                    const to = componentByEntity[dependency];
                    if (from !== to) dependencies[from].add(to);
                }
            }
            const pending = new Set(components.map((_, index) => index));
            const dependencyFirst = [];
            while (pending.size) {
                const ready = [...pending].filter((index) => [...dependencies[index]].every((item) => !pending.has(item)));
                ready.sort((left, right) => components[left][0].localeCompare(components[right][0]));
                if (!ready.length) throw new Error('Internal drop-order condensation graph failure.');
                for (const index of ready) {
                    dependencyFirst.push(...components[index]);
                    pending.delete(index);
                }
            }

            const tableByEntity = Object.fromEntries(physical.tables.map((table) => [table.entity, table]));
            const prefix = physical.namespace ? `${physical.namespace}_` : '';
            return Object.freeze(dependencyFirst.reverse().map((entity) => Object.freeze({
                deprecated: deprecated.has(entity),
                entity,
                name: tableByEntity[entity]?.name ?? prefix + entity.split('/').filter(Boolean).join('_'),
            })));
        };

        Object.freeze(this);
    }
}
