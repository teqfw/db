// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Rebuild_Execute
 * @description Executes preflighted in-place or parallel rebuilds with explicit preservation, transaction ownership, and evidence.
 */

export default class TeqFw_Db_Back_RDb_Rebuild_Execute {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
     * @param {TeqFw_Db_Back_Dem_Registry_CoreValue} deps.coreValue
     * @param {TeqFw_Db_Back_RDb_Schema_A_Builder} deps.builder
     * @param {TeqFw_Db_Back_RDb_Schema_A_Plan} deps.planner
     */
    constructor({compile, coreValue, builder, planner}) {
        /** @param {any} value @param {WeakSet<object>} seen @returns {any} */
        const freeze = function (value, seen = new WeakSet()) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value) || ArrayBuffer.isView(value)) return value;
            if (seen.has(value)) return value;
            seen.add(value);
            for (const key of Reflect.ownKeys(value)) freeze(value[key], seen);
            return Object.freeze(value);
        };

        /** @param {string} value @returns {string} */
        const normalizeIdentity = (value) => value.trim();

        /**
         * @param {object} evidence
         * @param {Error} cause
         * @param {string} stage
         * @param {string|null} entity
         * @returns {Error}
         */
        const fail = function (evidence, cause, stage, entity = null) {
            evidence.accepted = false;
            evidence.status = 'failed';
            evidence.failures.push({entity, message: cause?.message ?? String(cause), name: cause?.name ?? 'Error', stage});
            if (cause?.evidence?.phases) {
                evidence.phases.push(...cause.evidence.phases.map((item) => ({
                    identity: item.identity, phase: item.phase, status: item.status,
                })));
            }
            const error = new Error(`Database rebuild failed in '${stage}': ${cause?.message ?? String(cause)}`, {cause});
            error.name = 'RebuildError';
            Object.defineProperty(error, 'evidence', {enumerable: true, value: freeze(evidence)});
            return Object.freeze(error);
        };

        /**
         * @param {object} transaction
         * @param {TeqFw_Db_Back_Api_RDb_Dialect} adapter
         * @returns {object}
         */
        const transactionConnection = function (transaction, adapter) {
            const knex = transaction?.getKnexTrx?.();
            if (!knex || !knex.schema) throw new TypeError('Target transaction must expose getKnexTrx() with a schema builder.');
            return Object.freeze({
                getDialectAdapter: () => adapter,
                getClient: () => knex,
                getSchemaBuilder: () => knex.schema,
            });
        };

        /**
         * @param {object} deps
         * @param {'inPlace'|'parallel'} deps.mode
         * @param {object} deps.compilation
         * @param {object} deps.sourceCompilation
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.source
         * @param {TeqFw_Db_Back_RDb_IConnect} deps.target
         * @param {string} deps.sourceId
         * @param {string} deps.targetId
         * @param {object} deps.snapshot
         * @param {boolean} deps.authorizeDiscard
         * @param {object} deps.transformations
         * @param {object} deps.sourceTransaction
         * @param {object} deps.targetTransaction
         * @param {object} deps.cycleStrategy
         * @returns {Promise<object>}
         */
        this.exec = async function ({
            mode,
            compilation,
            sourceCompilation = compilation,
            source,
            target,
            sourceId,
            targetId,
            snapshot,
            authorizeDiscard = false,
            transformations = {},
            sourceTransaction,
            targetTransaction,
            cycleStrategy,
        }) {
            compile.assertResult({value: compilation});
            compile.assertResult({value: sourceCompilation});
            if (!['inPlace', 'parallel'].includes(mode)) throw new TypeError(`Unsupported rebuild mode '${mode}'.`);
            if (!source || !target) throw new TypeError('Explicit source and target connections are required.');
            if (typeof sourceId !== 'string' || !normalizeIdentity(sourceId)
                || typeof targetId !== 'string' || !normalizeIdentity(targetId)) {
                throw new TypeError('Explicit non-empty sourceId and targetId are required.');
            }
            sourceId = normalizeIdentity(sourceId);
            targetId = normalizeIdentity(targetId);
            if (mode === 'inPlace' && (source !== target || sourceId !== targetId)) {
                throw new TypeError('An in-place rebuild requires the same source/target connection and identity.');
            }
            if (mode === 'parallel' && sourceId === targetId) {
                throw new TypeError('A parallel rebuild requires distinct source and target identities.');
            }
            if (mode === 'parallel' && source === target) {
                const sourceNames = new Set(sourceCompilation.physical.tables.map((table) => table.name));
                const targetNames = new Set(compilation.physical.tables.map((table) => table.name));
                const overlap = [...sourceNames].filter((name) => targetNames.has(name));
                if (!sourceCompilation.physical.namespace || !compilation.physical.namespace
                    || sourceCompilation.physical.namespace === compilation.physical.namespace || overlap.length) {
                    throw new TypeError('A same-connection parallel rebuild requires distinct namespaces and disjoint physical tables.');
                }
            }
            const hasSnapshot = snapshot !== undefined;
            if (hasSnapshot && typeof snapshot?.readTable !== 'function') {
                throw new TypeError('Snapshot provider must expose readTable().');
            }
            if (mode === 'inPlace' && !hasSnapshot && authorizeDiscard !== true) {
                throw new TypeError('In-place rebuild requires a verified readable snapshot or explicit discard authorization.');
            }
            if (!transformations || typeof transformations !== 'object' || Array.isArray(transformations)) {
                throw new TypeError('Transformations must be a closed identity map.');
            }

            const sourceAdapter = source.getDialectAdapter();
            const targetAdapter = target.getDialectAdapter();
            const sourceDescription = await sourceAdapter.describe();
            const targetDescription = await targetAdapter.describe();
            if (sourceDescription.id !== sourceCompilation.physical.adapter) {
                throw new TypeError('Source compilation and source connection adapters do not match.');
            }
            if (targetDescription.id !== compilation.physical.adapter) {
                throw new TypeError('Target compilation and target connection adapters do not match.');
            }
            if (sourceTransaction?.getDialectAdapter) {
                const transactionAdapter = await sourceTransaction.getDialectAdapter().describe();
                if (transactionAdapter.id !== sourceDescription.id) throw new TypeError('Source transaction adapter identity does not match the source.');
            }
            if (targetTransaction?.getDialectAdapter) {
                const transactionAdapter = await targetTransaction.getDialectAdapter().describe();
                if (transactionAdapter.id !== targetDescription.id) throw new TypeError('Target transaction adapter identity does not match the target.');
            }

            const targetEntities = compilation.graph.topological;
            const sourceEntities = new Set(sourceCompilation.graph.entities);
            const missingSource = targetEntities.filter((entity) => !sourceEntities.has(entity));
            const removedSource = [...sourceEntities].filter((entity) => !targetEntities.includes(entity));
            if (missingSource.length || removedSource.length) {
                throw new TypeError('Rebuild does not infer entity additions, removals, or renames; source and target entity identities must match.');
            }

            // Transfer/cycle planning is completed before snapshot reads or any target write.
            planner.exec({compilation, cycleStrategy, includeData: true, operation: 'transfer'});
            const targetPlan = planner.exec({compilation, cycleStrategy, includeData: true, operation: 'rebuild'});
            const dropPlan = mode === 'inPlace' ? planner.exec({compilation: sourceCompilation, operation: 'drop'}) : null;
            if (compilation.graph.cycles.length > 0 && targetTransaction) {
                throw new TypeError('Cyclic transfer strategy requires one rebuild-owned target transaction.');
            }

            const targetByEntity = Object.fromEntries(compilation.physical.tables.map((table) => [table.entity, table]));
            const sourceByEntity = Object.fromEntries(sourceCompilation.physical.tables.map((table) => [table.entity, table]));
            const transformByEntity = {};
            for (const [identity, value] of Object.entries(transformations).sort(([left], [right]) => left.localeCompare(right))) {
                const fields = value && typeof value === 'object' ? Reflect.ownKeys(value).filter((name) => typeof name !== 'string' || !['exec', 'id'].includes(name)) : [];
                if (!value || typeof value !== 'object' || typeof value.id !== 'string' || !value.id.trim() || typeof value.exec !== 'function' || fields.length) {
                    throw new TypeError(`Transformation '${identity}' requires stable id and exec function.`);
                }
                const matches = targetEntities.filter((entity) => entity === identity || targetByEntity[entity].name === identity);
                if (matches.length !== 1) throw new TypeError(`Transformation identity '${identity}' does not name exactly one target entity.`);
                const entity = matches[0];
                if (transformByEntity[entity]) throw new TypeError(`Transformation for '${entity}' is declared more than once.`);
                transformByEntity[entity] = value;
            }

            const evidence = {
                accepted: false,
                dataComplete: false,
                failures: [],
                fingerprint: compilation.fingerprint,
                generatedState: [],
                mode,
                mutationStarted: false,
                phases: [],
                preservation: {authorizedDiscard: authorizeDiscard === true, status: 'notStarted', tables: []},
                preflight: {},
                source: {adapter: sourceDescription.id, fingerprint: sourceCompilation.fingerprint, id: sourceId},
                status: 'running',
                strategy: null,
                tables: [],
                target: {adapter: targetDescription.id, fingerprint: compilation.fingerprint, id: targetId},
                transaction: {owned: !targetTransaction, outcome: 'notStarted'},
                transformations: [],
            };
            let activeEntity = null;
            let activeStage = 'preflight';
            let ownedTransaction;
            const snapshotRows = {};

            try {
                const sourcePreflight = await sourceAdapter.preflight({
                    connection: sourceTransaction ?? source,
                    fingerprint: sourceCompilation.fingerprint,
                    operation: 'rebuild-source',
                    requirements: sourceCompilation.physical.phases.preflight.requirements,
                });
                const targetPreflight = await targetAdapter.preflight({
                    connection: targetTransaction ?? target,
                    fingerprint: compilation.fingerprint,
                    operation: 'rebuild-target',
                    requirements: targetPlan.phases.preflight.requirements,
                });
                evidence.preflight = {source: sourcePreflight, target: targetPreflight};
                const diagnostics = [...(sourcePreflight.diagnostics ?? []), ...(targetPreflight.diagnostics ?? [])];
                if (diagnostics.length) {
                    const error = new Error(`Rebuild capability preflight failed with ${diagnostics.length} error(s).`);
                    error.name = 'DemPreflightError';
                    Object.defineProperty(error, 'diagnostics', {enumerable: true, value: Object.freeze(diagnostics)});
                    throw error;
                }

                activeStage = 'preservation';
                if (hasSnapshot) {
                    for (const entity of sourceCompilation.graph.topological) {
                        activeEntity = entity;
                        const table = sourceByEntity[entity];
                        const rows = await snapshot.readTable({entity, table: table.name});
                        if (!Array.isArray(rows)) throw new TypeError(`Snapshot reader for '${entity}' must return an array.`);
                        snapshotRows[entity] = structuredClone(rows);
                        evidence.preservation.tables.push({entity, rows: rows.length, table: table.name});
                    }
                    evidence.preservation.status = 'verifiedReadable';
                } else if (authorizeDiscard === true) {
                    evidence.preservation.status = 'discardAuthorized';
                } else {
                    evidence.preservation.status = 'notRequired';
                }

                activeEntity = null;
                activeStage = 'transaction';
                const transaction = targetTransaction ?? (ownedTransaction = await target.startTransaction());
                const executionConnection = transactionConnection(transaction, targetAdapter);
                const targetKnex = transaction.getKnexTrx();
                evidence.transaction.outcome = 'started';
                evidence.mutationStarted = true;

                if (dropPlan) {
                    activeStage = 'drop';
                    const drop = await builder.exec({adapter: targetAdapter, connection: executionConnection, plan: dropPlan});
                    evidence.phases.push(...drop.phases.map((item) => ({identity: item.identity, phase: item.phase, status: item.status})));
                }

                /** @returns {Promise<object>} */
                const transfer = async function () {
                    activeStage = 'data';
                    if (mode === 'inPlace' && authorizeDiscard === true && !hasSnapshot) {
                        for (const entity of targetEntities) {
                            const table = targetByEntity[entity];
                            evidence.tables.push({entity, sourceRows: 0, status: 'discardAuthorized', targetRows: 0, table: table.name});
                        }
                        evidence.dataComplete = true;
                        return {tables: evidence.tables};
                    }
                    evidence.strategy = await targetAdapter.prepareTransfer({cycleStrategy, transaction});
                    const sourceKnex = sourceTransaction?.getKnexTrx?.()
                        ?? (source === target ? targetKnex : source.getClient());
                    for (const entity of targetEntities) {
                        activeEntity = entity;
                        const targetTable = targetByEntity[entity];
                        const sourceTable = sourceByEntity[entity];
                        const rows = hasSnapshot ? structuredClone(snapshotRows[entity])
                            : await sourceKnex(sourceTable.name).select();
                        if (!Array.isArray(rows)) throw new TypeError(`Source reader for '${entity}' must return an array.`);
                        const transformation = transformByEntity[entity];
                        const output = [];
                        for (const sourceRow of rows) {
                            const decoded = {};
                            for (const column of sourceTable.columns) {
                                decoded[column.name] = sourceAdapter.decodeValue({column, value: sourceRow[column.name]});
                            }
                            const transformed = transformation
                                ? await transformation.exec({entity, row: structuredClone(decoded)}) : decoded;
                            if (!transformed || typeof transformed !== 'object' || Array.isArray(transformed)) {
                                throw new TypeError(`Transformation for '${entity}' must return a row object.`);
                            }
                            const targetColumns = new Set(targetTable.columns.map((column) => column.name));
                            const unknown = Reflect.ownKeys(transformed).filter((name) => typeof name !== 'string' || !targetColumns.has(name)).map(String).sort();
                            if (unknown.length) {
                                throw new TypeError(`Transferred row for '${entity}' contains unknown target value '${unknown[0]}'.`);
                            }
                            const encoded = {};
                            for (const column of targetTable.columns) {
                                const value = transformed[column.name];
                                if (value === undefined) {
                                    if (!column.nullable && column.defaultValue === undefined && column.generation === undefined) {
                                        throw new TypeError(`Required target value '${entity}/${column.name}' is absent.`);
                                    }
                                } else if (value === null) {
                                    if (!column.nullable) throw new TypeError(`Non-null target value '${entity}/${column.name}' is null.`);
                                    encoded[column.name] = null;
                                } else {
                                    if (!coreValue.matches({type: column.logicalType, value})) {
                                        throw new TypeError(`Target value '${entity}/${column.name}' violates its logical type.`);
                                    }
                                    encoded[column.name] = targetAdapter.encodeValue({column, value});
                                }
                            }
                            output.push(encoded);
                        }
                        if (output.length) await targetKnex(targetTable.name).insert(output);
                        const countRow = await targetKnex(targetTable.name).count({count: '*'}).first();
                        const targetRows = Number(countRow?.count);
                        if (!Number.isSafeInteger(targetRows) || targetRows !== output.length) {
                            throw new Error(`Target row-count verification failed for '${entity}'.`);
                        }
                        evidence.tables.push({
                            entity,
                            sourceRows: rows.length,
                            status: 'verified',
                            table: targetTable.name,
                            targetRows,
                            transformation: transformation?.id,
                        });
                        if (transformation) evidence.transformations.push({entity, id: transformation.id});
                    }
                    activeEntity = null;
                    evidence.generatedState = await targetAdapter.restoreGeneratedState({
                        compilation, tables: Object.values(targetByEntity), transaction,
                    });
                    evidence.dataComplete = true;
                    return {tables: evidence.tables};
                };

                activeStage = 'schemaAndData';
                const build = await builder.exec({adapter: targetAdapter, connection: executionConnection, data: transfer, plan: targetPlan});
                evidence.phases.push(...build.phases.map((item) => ({identity: item.identity, phase: item.phase, status: item.status})));
                activeStage = 'commit';
                if (ownedTransaction) {
                    await ownedTransaction.commit();
                    evidence.transaction.outcome = 'committed';
                } else {
                    evidence.transaction.outcome = 'externalUnchanged';
                }
                evidence.status = 'complete';
                return freeze(evidence);
            } catch (cause) {
                if (ownedTransaction) {
                    try {
                        await ownedTransaction.rollback();
                        evidence.transaction.outcome = 'rolledBack';
                    } catch (rollback) {
                        evidence.transaction.outcome = 'rollbackFailed';
                        evidence.failures.push({entity: activeEntity, message: rollback.message, name: rollback.name, stage: 'rollback'});
                    }
                } else if (targetTransaction) {
                    evidence.transaction.outcome = 'externalUnchanged';
                }
                const schemaFailure = cause?.evidence?.phases?.findLast?.((item) => item.status === 'failed');
                const failureStage = schemaFailure?.phase ?? (evidence.dataComplete ? 'afterData' : activeStage);
                const indexed = [...compilation.physical.phases.afterRelations, ...compilation.physical.phases.afterData]
                    .find((item) => item.name === schemaFailure?.identity);
                const failureEntity = indexed?.entity ?? activeEntity;
                const tableEvidence = failureEntity
                    ? evidence.tables.find((item) => item.entity === failureEntity) : null;
                if (tableEvidence) {
                    tableEvidence.error = {message: cause?.message ?? String(cause), name: cause?.name ?? 'Error'};
                    tableEvidence.status = 'failed';
                } else if (failureEntity) {
                    evidence.tables.push({
                        entity: failureEntity,
                        error: {message: cause?.message ?? String(cause), name: cause?.name ?? 'Error'},
                        status: 'failed',
                        table: targetByEntity[failureEntity]?.name ?? sourceByEntity[failureEntity]?.name,
                    });
                }
                throw fail(evidence, cause, failureStage, failureEntity);
            }
        };

        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        compile: 'TeqFw_Db_Back_Dem_Compile$',
        coreValue: 'TeqFw_Db_Back_Dem_Registry_CoreValue$',
        builder: 'TeqFw_Db_Back_RDb_Schema_A_Builder$',
        planner: 'TeqFw_Db_Back_RDb_Schema_A_Plan$',
    }),
});
