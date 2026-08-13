import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
const builder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Plan} */
const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
/** @type {TeqFw_Db_Back_RDb_Rebuild} */
const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

const connections = [];

afterEach(async () => {
    while (connections.length) await connections.pop().disconnect();
});

async function connect() {
    const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    connections.push(connection);
    return connection;
}

function primary() {
    return {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'};
}

async function compilation(namespace) {
    const integer = (generation = false) => ({
        ...(generation ? {generation: {kind: 'core.identity', params: {mode: 'byDefault'}}} : {}),
        type: {id: 'core.integer', params: {bits: 32, unsigned: false}},
    });
    const declaration = {
        version: 2, requires: [], package: {}, refs: {},
        entity: {
            parent: {
                attr: {id: integer(true), name: {type: {id: 'core.string', params: {length: 32}}}},
                index: {pk: primary()}, relation: {},
            },
            child: {
                attr: {id: integer(true), parent_id: integer()},
                index: {pk: primary()},
                relation: {
                    parent: {
                        action: {}, attrs: ['parent_id'], deferrable: 'notDeferrable',
                        ref: {attrs: ['id'], path: '/parent'},
                    },
                },
            },
        },
    };
    return compile.exec({
        adapter,
        fragments: [{declaration, filename: `/fixtures/${namespace}/schema.json`, fragmentId: namespace, packageName: namespace}],
        mapEnvelope: {
            declaration: {version: 2, namespace}, filename: `/fixtures/${namespace}/map.json`,
            mapId: `${namespace}:map`, packageName: namespace,
        },
    });
}

async function createSource(connection, result) {
    await builder.exec({adapter, connection, plan: planner.exec({compilation: result, operation: 'create'})});
    const tables = Object.fromEntries(result.physical.tables.map((table) => [table.entity, table.name]));
    await connection.getClient()(tables['/parent']).insert([{id: 1, name: 'first'}, {id: 2, name: 'second'}]);
    await connection.getClient()(tables['/child']).insert([{id: 10, parent_id: 1}, {id: 11, parent_id: 2}]);
}

async function snapshot(connection, result, failEntity = null) {
    const rows = {};
    for (const table of result.physical.tables) rows[table.entity] = await connection.getClient()(table.name).select();
    return {
        verified: true,
        readTable: async ({entity}) => {
            if (entity === failEntity) throw new Error(`snapshot unreadable for ${entity}`);
            return structuredClone(rows[entity]);
        },
    };
}

describe('rebuild safety hardening', () => {
    it('reads and caches every snapshot table before destructive in-place mutation', async () => {
        const connection = await connect();
        const result = await compilation('src');
        await createSource(connection, result);
        const unreadable = await snapshot(connection, result, '/child');

        await assert.rejects(rebuild.exec({
            compilation: result,
            mode: 'inPlace',
            snapshot: unreadable,
            source: connection,
            sourceId: 'same',
            target: connection,
            targetId: 'same',
        }), (error) => {
            assert.equal(error.name, 'RebuildError');
            assert.equal(error.evidence.mutationStarted, false);
            assert.equal(error.evidence.failures[0].stage, 'preservation');
            return true;
        });
        assert.equal(await connection.getSchemaBuilder().hasTable('src_parent'), true);
        assert.equal(Number((await connection.getClient()('src_parent').count({count: '*'}).first()).count), 2);
    });

    it('drops from sourceCompilation and restores a pre-read snapshot into a distinct target compilation', async () => {
        const connection = await connect();
        const sourceCompilation = await compilation('src');
        const targetCompilation = await compilation('dst');
        await createSource(connection, sourceCompilation);
        const preserved = await snapshot(connection, sourceCompilation);

        const evidence = await rebuild.exec({
            compilation: targetCompilation,
            mode: 'inPlace',
            snapshot: preserved,
            source: connection,
            sourceCompilation,
            sourceId: 'same',
            target: connection,
            targetId: 'same',
        });
        assert.equal(evidence.preservation.status, 'verifiedReadable');
        assert.equal(await connection.getSchemaBuilder().hasTable('src_parent'), false);
        assert.equal(await connection.getSchemaBuilder().hasTable('dst_parent'), true);
        assert.equal(Number((await connection.getClient()('dst_parent').count({count: '*'}).first()).count), 2);
    });

    it('allows same-connection parallel rebuild only through distinct namespaces and preserves the source', async () => {
        const connection = await connect();
        const sourceCompilation = await compilation('src');
        const targetCompilation = await compilation('dst');
        await createSource(connection, sourceCompilation);

        const evidence = await rebuild.exec({
            compilation: targetCompilation,
            mode: 'parallel',
            source: connection,
            sourceCompilation,
            sourceId: 'source-namespace',
            target: connection,
            targetId: 'target-namespace',
        });
        assert.equal(evidence.status, 'complete');
        assert.equal(Number((await connection.getClient()('src_parent').count({count: '*'}).first()).count), 2);
        assert.equal(Number((await connection.getClient()('dst_parent').count({count: '*'}).first()).count), 2);

        await assert.rejects(rebuild.exec({
            compilation: targetCompilation,
            mode: 'parallel',
            source: connection,
            sourceCompilation: targetCompilation,
            sourceId: 'same-namespace-source',
            target: connection,
            targetId: 'same-namespace-target',
        }), /distinct namespaces and disjoint physical tables/);
    });

    it('rejects unknown or duplicate transformation identities before target mutation', async () => {
        const source = await connect();
        const target = await connect();
        const result = await compilation('teq');
        await createSource(source, result);
        const transform = {id: 'copy-v1', exec: ({row}) => row};

        for (const transformations of [
            {'/missing': transform},
            {'/parent': transform, teq_parent: transform},
            {'/parent': {...transform, extra: true}},
            {'/parent': {...transform, id: '   '}},
        ]) {
            await assert.rejects(rebuild.exec({
                compilation: result,
                mode: 'parallel',
                source,
                sourceId: 'source',
                target,
                targetId: 'target',
                transformations,
            }), /Transformation/);
            assert.equal(await target.getSchemaBuilder().hasTable('teq_parent'), false);
        }
    });

    it('rejects unknown transformed fields and rolls back its owned target transaction', async () => {
        const source = await connect();
        const target = await connect();
        const result = await compilation('teq');
        await createSource(source, result);

        await assert.rejects(rebuild.exec({
            compilation: result,
            mode: 'parallel',
            source,
            sourceId: 'source',
            target,
            targetId: 'target',
            transformations: {
                '/parent': {id: 'invalid-output-v1', exec: ({row}) => ({...row, undeclared: true})},
            },
        }), (error) => {
            assert.equal(error.evidence.status, 'failed');
            assert.equal(error.evidence.transaction.outcome, 'rolledBack');
            assert.equal(error.evidence.tables[0].entity, '/parent');
            assert.equal(error.evidence.tables[0].status, 'failed');
            return true;
        });
        assert.equal(await target.getSchemaBuilder().hasTable('teq_parent'), false);
        assert.equal(await source.getSchemaBuilder().hasTable('teq_parent'), true);
    });
});
