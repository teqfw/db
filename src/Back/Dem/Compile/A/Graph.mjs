// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_Graph
 * @description Builds deterministic relation adjacency, SCC cycles, and dependency-first order.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_Graph {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Graph.Factory} deps.graphFactory
     */
    constructor({graphFactory}) {
        /**
         * @param {object} deps
         * @param {object} deps.validated
         * @returns {object}
         */
        this.exec = function ({validated}) {
            const entities = Object.keys(validated.entities).sort();
            const edges = [];
            for (const from of entities) {
                const info = validated.entities[from];
                for (const relationName of Object.keys(info.entity.relation ?? {}).sort()) {
                    const relation = info.entity.relation[relationName];
                    if (!validated.entities[relation.ref.path]) continue;
                    const path = `${info.pointer}/relation/${relationName.replaceAll('~', '~0').replaceAll('/', '~1')}`;
                    edges.push({
                        deferrable: relation.deferrable,
                        from,
                        path,
                        relation: relationName,
                        sources: validated.provenance[path] ?? [],
                        to: relation.ref.path,
                    });
                }
            }
            edges.sort((a, b) => `${a.from}\u0000${a.to}\u0000${a.relation}`.localeCompare(`${b.from}\u0000${b.to}\u0000${b.relation}`));
            const adjacency = {};
            for (const entity of entities) adjacency[entity] = [];
            for (const edge of edges) adjacency[edge.from].push(edge.to);
            for (const entity of entities) adjacency[entity] = [...new Set(adjacency[entity])].sort();

            let nextIndex = 0;
            const indexByEntity = {};
            const lowByEntity = {};
            const onStack = new Set();
            const stack = [];
            const components = [];

            /**
             * @param {string} entity
             */
            const visit = function (entity) {
                indexByEntity[entity] = nextIndex;
                lowByEntity[entity] = nextIndex;
                nextIndex++;
                stack.push(entity);
                onStack.add(entity);
                for (const target of adjacency[entity]) {
                    if (indexByEntity[target] === undefined) {
                        visit(target);
                        lowByEntity[entity] = Math.min(lowByEntity[entity], lowByEntity[target]);
                    } else if (onStack.has(target)) {
                        lowByEntity[entity] = Math.min(lowByEntity[entity], indexByEntity[target]);
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
            components.sort((a, b) => a[0].localeCompare(b[0]));
            const componentByEntity = {};
            components.forEach((component, index) => component.forEach((entity) => componentByEntity[entity] = index));

            const cycles = [];
            for (const component of components) {
                const members = new Set(component);
                const internal = edges.filter((edge) => members.has(edge.from) && members.has(edge.to));
                if (component.length > 1 || internal.some((edge) => edge.from === edge.to)) {
                    cycles.push({
                        entities: [...component],
                        relations: internal.map((edge) => ({
                            deferrable: edge.deferrable,
                            from: edge.from,
                            path: edge.path,
                            relation: edge.relation,
                            sources: edge.sources,
                            to: edge.to,
                        })),
                    });
                }
            }

            const dependencies = components.map(() => new Set());
            for (const edge of edges) {
                const from = componentByEntity[edge.from];
                const to = componentByEntity[edge.to];
                if (from !== to) dependencies[from].add(to);
            }
            const pending = new Set(components.map((_, index) => index));
            const topological = [];
            while (pending.size > 0) {
                const ready = [...pending].filter((index) => [...dependencies[index]].every((item) => !pending.has(item)));
                ready.sort((a, b) => components[a][0].localeCompare(components[b][0]));
                if (ready.length === 0) break;
                for (const index of ready) {
                    topological.push(...components[index]);
                    pending.delete(index);
                }
            }
            const graph = graphFactory.create({cycles, edges, entities, topological});
            return {...validated, graph};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        graphFactory: 'TeqFw_Db_Back_Dto_Dem_Compile_Graph__Factory$',
    }),
});
