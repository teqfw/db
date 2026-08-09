// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema_A_Builder_Execute
 * @description Executes immutable schema plan operations through a selected dialect adapter.
 */

export default class TeqFw_Db_Back_RDb_Schema_A_Builder_Execute {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Schema_A_Plan} deps.planner
     * Initialize schema plan execution.
     */
    constructor({planner}) {
        /**
         * @param {object} deps
         * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.adapter
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.connection
         * @param {object} deps.plan
         * @param {Function} deps.data
         * @returns {Promise<object>}
         */
        this.exec = async function ({adapter, connection, plan, data}) {
            planner.assertPlan({value: plan});
            const requiredMethods = ['describe', 'preflight', 'addColumn', 'addConstraint', 'addRelation', 'addIndex', 'dropRelation'];
            const missing = requiredMethods.filter((name) => typeof adapter?.[name] !== 'function');
            if (missing.length > 0) throw new TypeError(`Dialect adapter execution methods are missing: ${missing.join(', ')}.`);
            const description = await adapter.describe();
            if (description.id !== plan.adapter) {
                throw new TypeError("Schema plan adapter '" + plan.adapter + "' does not match execution adapter '" + description.id + "'.");
            }
            const preflight = await adapter.preflight({
                connection,
                fingerprint: plan.fingerprint,
                operation: plan.operation,
                requirements: plan.phases.preflight.requirements,
            });
            if (preflight.diagnostics?.length > 0) {
                const error = new Error(`Database capability preflight failed with ${preflight.diagnostics.length} error(s).`);
                error.name = 'DemPreflightError';
                Object.defineProperty(error, 'evidence', {enumerable: true, value: preflight});
                throw Object.freeze(error);
            }
            const phases = [];
            const knex = connection.getKnex();
            let active = {identity: 'execution', phase: 'execution'};
            try {

            if (plan.operation === 'drop') {
                for (const relation of plan.phases.relations) {
                    active = {identity: relation.name, phase: 'relations'};
                    const exists = await connection.getSchemaBuilder().hasTable(relation.table);
                    if (!exists) continue;
                    await connection.getSchemaBuilder().alterTable(relation.table, (tableBuilder) => {
                        adapter.dropRelation({knex, relation, tableBuilder});
                    });
                    phases.push({identity: relation.name, phase: 'relations', status: 'complete'});
                }
                for (const table of plan.phases.tables) {
                    active = {identity: table.name, phase: 'tables'};
                    await connection.getSchemaBuilder().dropTableIfExists(table.name);
                    phases.push({identity: table.name, phase: 'tables', status: 'complete'});
                }
            } else {
                for (const operation of plan.phases.tables) {
                    active = {identity: operation.table.name, phase: 'tables'};
                    await connection.getSchemaBuilder().createTable(operation.table.name, (tableBuilder) => {
                        if (operation.table.comment) tableBuilder.comment(operation.table.comment);
                        for (const column of operation.table.columns) adapter.addColumn({column, knex, tableBuilder});
                        for (const constraint of operation.constraints) {
                            adapter.addConstraint({constraint, knex, tableBuilder});
                        }
                    });
                    phases.push({identity: operation.table.name, phase: 'tables', status: 'complete'});
                }
                for (const relation of plan.phases.relations) {
                    active = {identity: relation.name, phase: 'relations'};
                    await connection.getSchemaBuilder().alterTable(relation.table, (tableBuilder) => {
                        adapter.addRelation({knex, relation, tableBuilder});
                    });
                    phases.push({identity: relation.name, phase: 'relations', status: 'complete'});
                }
                /** @param {string} phase @returns {Promise<void>} */
                const executeIndexes = async function (phase) {
                    for (const index of plan.phases[phase]) {
                        active = {identity: index.name, phase};
                        const table = plan.phases.tables.find((item) => item.table.entity === index.entity)?.table;
                        if (!table) throw new TypeError(`Index '${index.name}' has no physical table.`);
                        await adapter.addIndex({connection, index, knex, table});
                        phases.push({identity: index.name, phase, status: 'complete'});
                    }
                };
                await executeIndexes('afterRelations');
                if (typeof data === 'function') {
                    active = {identity: 'data', phase: 'data'};
                    const evidence = await data();
                    phases.push({evidence, identity: 'data', phase: 'data', status: 'complete'});
                }
                await executeIndexes('afterData');
            }
            for (const verification of plan.phases.verification ?? []) {
                active = {identity: verification.name, phase: 'verification'};
                const expected = verification.kind === 'tableExists' ? true
                    : verification.kind === 'tableAbsent' ? false : null;
                if (expected === null) {
                    throw new TypeError("Schema verification kind '" + verification.kind + "' is not registered.");
                }
                const actual = await connection.getSchemaBuilder().hasTable(verification.name);
                const evidence = {actual, expected, kind: verification.kind, name: verification.name};
                if (actual !== expected) {
                    const error = new Error("Schema verification failed for table '" + verification.name + "'.");
                    error.name = 'DemVerificationError';
                    Object.defineProperty(error, 'evidence', {enumerable: true, value: Object.freeze(evidence)});
                    throw Object.freeze(error);
                }
                phases.push({evidence: Object.freeze(evidence), identity: verification.name, phase: 'verification', status: 'complete'});
            }
            } catch (cause) {
                const failure = Object.freeze({
                    error: Object.freeze({message: cause?.message ?? String(cause), name: cause?.name ?? 'Error'}),
                    identity: active.identity,
                    phase: active.phase,
                    status: 'failed',
                });
                phases.push(failure);
                const evidence = Object.freeze({
                    fingerprint: plan.fingerprint,
                    operation: plan.operation,
                    phases: Object.freeze([...phases]),
                    preflight,
                    status: 'failed',
                });
                const message = cause?.message ?? String(cause);
                const error = new Error("Schema execution failed in phase '" + active.phase + "': " + message, {cause});
                error.name = 'DemSchemaExecutionError';
                Object.defineProperty(error, 'evidence', {enumerable: true, value: evidence});
                throw Object.freeze(error);
            }
            const result = {
                fingerprint: plan.fingerprint,
                operation: plan.operation,
                phases,
                preflight,
                status: 'complete',
            };
            Object.freeze(result.phases);
            return Object.freeze(result);
        };
    }
}
export const __deps__ = Object.freeze({
    default: Object.freeze({
        planner: 'TeqFw_Db_Back_RDb_Schema_A_Plan$',
    }),
});
