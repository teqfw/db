import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container, localCfg} from '../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
const builder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Plan} */
const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
/** @type {TeqFw_Db_Back_RDb_Rebuild} */
const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');
/** @type {TeqFw_Db_Back_Mod_Selection} */
const selection = await container.get('TeqFw_Db_Back_Mod_Selection$');

const tableNames = new Set();
const connections = [];

async function connect() {
    const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({...localCfg.pg, acquireConnectionTimeout: 5000});
    connections.push(connection);
    return connection;
}

function vectorAttr(storage, dimensions, element = 'float', sparse = false) {
    return {
        storage: {postgresql: {type: storage, params: {}}},
        type: {id: 'core.vector', params: {dimensions, element, sparse}},
    };
}

function primary() {
    return {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'};
}

function vectorDeclaration(withIndexes) {
    const index = {pk: primary()};
    if (withIndexes) {
        const matrix = [
            ['hnsw', 'bits', ['bit_hamming_ops', 'bit_jaccard_ops']],
            ['hnsw', 'dense', ['vector_l2_ops', 'vector_ip_ops', 'vector_cosine_ops', 'vector_l1_ops']],
            ['hnsw', 'half', ['halfvec_l2_ops', 'halfvec_ip_ops', 'halfvec_cosine_ops', 'halfvec_l1_ops']],
            ['hnsw', 'sparse', ['sparsevec_l2_ops', 'sparsevec_ip_ops', 'sparsevec_cosine_ops', 'sparsevec_l1_ops']],
            ['ivfflat', 'bits', ['bit_hamming_ops']],
            ['ivfflat', 'dense', ['vector_l2_ops', 'vector_ip_ops', 'vector_cosine_ops']],
            ['ivfflat', 'half', ['halfvec_l2_ops', 'halfvec_ip_ops', 'halfvec_cosine_ops']],
        ];
        let identity = 0;
        for (const [method, attr, classes] of matrix) {
            for (const operatorClass of classes) {
                index[`i${identity++}`] = {
                    include: [],
                    keys: [{attr, operatorClass: `postgresql.${operatorClass}`}],
                    kind: 'index',
                    method: `postgresql.${method}`,
                    options: method === 'hnsw' ? {m: 8, ef_construction: 32} : {lists: 1},
                    phase: 'afterData',
                };
            }
        }
    }
    return {
        version: 2, package: {}, refs: {}, requires: [],
        entity: {
            item: {
                attr: {
                    bits: vectorAttr('bit', 8, 'bit', false),
                    dense: vectorAttr('vector', 3),
                    half: vectorAttr('halfvec', 3),
                    id: {
                        generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
                        type: {id: 'core.integer', params: {bits: 32, unsigned: false}},
                    },
                    sparse: vectorAttr('sparsevec', 8, 'float', true),
                },
                index,
                relation: {},
            },
        },
    };
}

function cycleDeclaration() {
    const integer = () => ({type: {id: 'core.integer', params: {bits: 32, unsigned: false}}});
    const relation = (path, attr) => ({
        action: {delete: 'restrict', update: 'restrict'},
        attrs: [attr],
        deferrable: 'deferred',
        ref: {attrs: ['id'], path},
    });
    return {
        version: 2, package: {}, refs: {}, requires: [],
        entity: {
            left: {
                attr: {id: integer(), right_id: integer()},
                index: {pk: primary()},
                relation: {right: relation('/right', 'right_id')},
            },
            right: {
                attr: {id: integer(), left_id: integer()},
                index: {pk: primary()},
                relation: {left: relation('/left', 'left_id')},
            },
        },
    };
}

async function compilation(adapter, namespace, declaration) {
    const result = await compile.exec({
        adapter,
        fragments: [{
            declaration, filename: `/opt/${namespace}/schema.json`, fragmentId: namespace, packageName: namespace,
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace}, filename: `/opt/${namespace}/map.json`,
            mapId: `${namespace}:map`, packageName: namespace,
        },
    });
    for (const table of result.physical.tables) tableNames.add(table.name);
    return result;
}

async function create(connection, compilationResult) {
    const adapter = connection.getDialectAdapter();
    await builder.exec({adapter, connection, plan: planner.exec({compilation: compilationResult, operation: 'create'})});
}

function encodedRows(adapter, table) {
    const raw = [
        {bits: '00000001', dense: [1, 0, 0], half: [1, 0, 0], id: 10, sparse: {dimensions: 8, entries: [{index: 1, value: 1}]}},
        {bits: '00000011', dense: [0, 1, 0], half: [0, 1, 0], id: 20, sparse: {dimensions: 8, entries: [{index: 2, value: 1}]}},
        {bits: '11110000', dense: [0, 0, 1], half: [0, 0, 1], id: 30, sparse: {dimensions: 8, entries: [{index: 3, value: 1}]}},
    ];
    return raw.map((row) => Object.fromEntries(table.columns.map((column) => [
        column.name, adapter.encodeValue({column, value: row[column.name]}),
    ])));
}

async function cleanup() {
    for (const connection of connections) {
        const knex = connection.getKnex();
        for (const table of [...tableNames].reverse()) {
            try {
                await knex.raw('drop table if exists ?? cascade', [table]);
            } catch {
                // The primary test failure is reported separately.
            }
        }
    }
    while (connections.length) await connections.pop().disconnect();
}

describe('opt-in PostgreSQL and pgvector', () => {
    it('passes storage, codec, distance, index, rebuild, sequence, option, and cycle conformance', async () => {
        try {
            const source = await connect();
            const target = await connect();
            const adapter = source.getDialectAdapter();
            const description = await adapter.describe();
            assert.equal(description.id, 'postgresql');

            const sourceCompilation = await compilation(adapter, 'optpgsrc', vectorDeclaration(false));
            const targetCompilation = await compilation(adapter, 'optpgtgt', vectorDeclaration(true));
            const capability = await adapter.preflight({
                connection: source,
                fingerprint: sourceCompilation.fingerprint,
                operation: 'create',
                requirements: sourceCompilation.requirements,
            });
            assert.deepEqual(capability.diagnostics, []);
            assert.match(capability.extensions.vector.installed, /^\d+\.\d+/);

            await create(source, sourceCompilation);
            const sourceTable = sourceCompilation.physical.tables[0];
            await source.getKnex()(sourceTable.name).insert(encodedRows(adapter, sourceTable));

            const evidence = await rebuild.exec({
                compilation: targetCompilation,
                mode: 'parallel',
                source,
                sourceCompilation,
                sourceId: 'postgresql-source',
                target,
                targetId: 'postgresql-target',
            });
            assert.equal(evidence.status, 'complete');
            assert.equal(evidence.accepted, false);
            assert.equal(evidence.tables[0].sourceRows, 3);
            assert.equal(evidence.generatedState.length, 1);
            const dataPosition = evidence.phases.findIndex((item) => item.phase === 'data');
            const firstLateIndex = evidence.phases.findIndex((item) => item.phase === 'afterData');
            assert.ok(dataPosition >= 0 && firstLateIndex > dataPosition);

            const targetTable = targetCompilation.physical.tables[0];
            const catalogIndexes = await target.getKnex()('pg_indexes')
                .select('indexname', 'indexdef').where({tablename: targetTable.name});
            assert.equal(catalogIndexes.length, 22);
            assert.equal(catalogIndexes.filter((item) => / USING hnsw /i.test(item.indexdef)).length, 14);
            assert.equal(catalogIndexes.filter((item) => / USING ivfflat /i.test(item.indexdef)).length, 7);

            const catalogTypes = await target.getKnex().raw(`
                select a.attname, format_type(a.atttypid, a.atttypmod) as type
                from pg_attribute a join pg_class c on c.oid = a.attrelid
                where c.relname = ? and a.attnum > 0 and not a.attisdropped
            `, [targetTable.name]);
            const types = Object.fromEntries(catalogTypes.rows.map((item) => [item.attname, item.type]));
            assert.equal(types.dense, 'vector(3)');
            assert.equal(types.half, 'halfvec(3)');
            assert.equal(types.bits, 'bit(8)');
            assert.equal(types.sparse, 'sparsevec(8)');

            const generatedRow = encodedRows(adapter, targetTable)[0];
            delete generatedRow.id;
            const inserted = await target.getKnex()(targetTable.name).insert(generatedRow).returning('id');
            assert.equal(inserted[0].id, 31);

            const transaction = await source.startTransaction();
            const meta = {columns: sourceTable.columns};
            const cases = [
                ['dense', 'l2Distance', [1, 0, 0]],
                ['dense', 'negativeInnerProduct', [1, 0, 0]],
                ['dense', 'cosineDistance', [1, 0, 0]],
                ['dense', 'l1Distance', [1, 0, 0]],
                ['half', 'l2Distance', [1, 0, 0]],
                ['half', 'negativeInnerProduct', [1, 0, 0]],
                ['half', 'cosineDistance', [1, 0, 0]],
                ['half', 'l1Distance', [1, 0, 0]],
                ['sparse', 'l2Distance', {dimensions: 8, entries: [{index: 1, value: 1}]}],
                ['sparse', 'negativeInnerProduct', {dimensions: 8, entries: [{index: 1, value: 1}]}],
                ['sparse', 'cosineDistance', {dimensions: 8, entries: [{index: 1, value: 1}]}],
                ['sparse', 'l1Distance', {dimensions: 8, entries: [{index: 1, value: 1}]}],
                ['bits', 'hammingDistance', '00000001'],
                ['bits', 'jaccardDistance', '00000001'],
            ];
            for (const [attr, operation, value] of cases) {
                const distance = {
                    kind: 'call', operator: `postgresql.pgvector.${operation}`, args: [
                        {kind: 'attr', name: attr}, {kind: 'value', value},
                    ],
                };
                const query = transaction.getKnexTrx()(sourceTable.name).select('*');
                await selection.populate(transaction, meta, query, {
                    version: 2,
                    limit: 3,
                    orderBy: [{direction: 'asc', expression: distance}],
                    select: [{as: 'distance', expression: distance}],
                });
                const rows = await query;
                assert.equal(rows.length, 3);
                assert.ok(rows.every((row, index) => index === 0 || Number(rows[index - 1].distance) <= Number(row.distance)));
            }
            await transaction.commit();

            const optionTransaction = await target.startTransaction();
            const distance = {
                kind: 'call', operator: 'postgresql.pgvector.l2Distance', args: [
                    {kind: 'attr', name: 'dense'}, {kind: 'value', value: [1, 0, 0]},
                ],
            };
            const optionQuery = optionTransaction.getKnexTrx()(targetTable.name).select('*');
            await selection.populate(optionTransaction, {columns: targetTable.columns}, optionQuery, {
                version: 2,
                execution: {'postgresql.hnsw.ef_search': 77, 'postgresql.ivfflat.probes': 1},
                limit: 2,
                orderBy: [{direction: 'asc', expression: distance}],
            });
            const localSetting = await optionTransaction.getKnexTrx().raw('show hnsw.ef_search');
            assert.equal(Number(Object.values(localSetting.rows[0])[0]), 77);
            await optionQuery;
            await optionTransaction.commit();
            const restoredTransaction = await target.startTransaction();
            const restoredSetting = await restoredTransaction.getKnexTrx().raw('show hnsw.ef_search');
            assert.notEqual(Number(Object.values(restoredSetting.rows[0])[0]), 77);
            await restoredTransaction.commit();

            const cycleSourceCompilation = await compilation(adapter, 'optpgcsrc', cycleDeclaration());
            const cycleTargetCompilation = await compilation(adapter, 'optpgctgt', cycleDeclaration());
            await create(source, cycleSourceCompilation);
            const cycleTrx = await source.startTransaction();
            await cycleTrx.raw('SET CONSTRAINTS ALL DEFERRED');
            await cycleTrx.getKnexTrx()('optpgcsrc_left').insert({id: 1, right_id: 1});
            await cycleTrx.getKnexTrx()('optpgcsrc_right').insert({id: 1, left_id: 1});
            await cycleTrx.commit();
            const cycleEvidence = await rebuild.exec({
                compilation: cycleTargetCompilation,
                cycleStrategy: {id: 'postgresql.deferredConstraints'},
                mode: 'parallel',
                source,
                sourceCompilation: cycleSourceCompilation,
                sourceId: 'postgresql-cycle-source',
                target,
                targetId: 'postgresql-cycle-target',
            });
            assert.equal(cycleEvidence.strategy.strategy, 'postgresql.deferredConstraints');
            assert.equal(cycleEvidence.transaction.owned, true);
            assert.equal(cycleEvidence.transaction.outcome, 'committed');
            assert.equal(cycleEvidence.tables.reduce((sum, item) => sum + item.targetRows, 0), 2);
        } finally {
            await cleanup();
        }
    });
});
