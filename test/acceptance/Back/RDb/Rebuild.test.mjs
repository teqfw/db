import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';
import {platformFragment} from '../../../data/Dem.mjs';

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

async function targetCompilation() {
    const identity = () => ({
        type: {id: 'core.integer', params: {bits: 32, unsigned: false}},
        generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
    });
    const declaration = {
        version: 2, requires: [], package: {}, refs: {},
        entity: {
            parent: {
                attr: {
                    id: identity(),
                    name: {type: {id: 'core.string', params: {length: 32}}},
                },
                index: {pk: primary()}, relation: {},
            },
            child: {
                attr: {
                    id: identity(),
                    parent_id: {type: {id: 'core.integer', params: {bits: 32, unsigned: false}}},
                },
                index: {
                    parent_lookup: {
                        include: [], keys: [{attr: 'parent_id'}], kind: 'index', method: 'core.btree',
                        options: {}, phase: 'afterData',
                    },
                    pk: primary(),
                },
                relation: {
                    parent: {
                        action: {delete: 'cascade'}, attrs: ['parent_id'], deferrable: 'notDeferrable',
                        ref: {attrs: ['id'], path: '/parent'},
                    },
                },
            },
        },
    };
    return compile.exec({
        adapter,
        fragments: [platformFragment(), {declaration, filename: '/fixtures/app/schema.json', fragmentId: 'app', packageName: 'app'}],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'teq'}, filename: '/fixtures/app/map.json', mapId: 'map', packageName: 'app',
        },
    });
}

async function createSource(connection, compilation) {
    const plan = planner.exec({compilation, operation: 'create'});
    await builder.exec({adapter, connection, plan});
    await connection.getClient()('teq_parent').insert([{id: 1, name: 'first'}, {id: 2, name: 'second'}]);
    await connection.getClient()('teq_child').insert([{id: 10, parent_id: 1}, {id: 11, parent_id: 2}]);
}

describe('TeqFw_Db_Back_RDb_Rebuild', () => {
    it('transfers a parallel target in dependency order and records transformation and late-index evidence', async () => {
        const source = await connect();
        const target = await connect();
        const compilation = await targetCompilation();
        await createSource(source, compilation);

        const evidence = await rebuild.exec({
            compilation,
            mode: 'parallel',
            source,
            sourceId: 'sqlite-source',
            target,
            targetId: 'sqlite-target',
            transformations: {
                '/parent': {id: 'uppercase-parent-v1', exec: ({row}) => ({...row, name: row.name.toUpperCase()})},
            },
        });

        assert.equal(evidence.status, 'complete');
        assert.equal(evidence.accepted, false);
        assert.deepEqual(evidence.tables.map((item) => item.entity), ['/parent', '/teqfw/db/schema/snapshot', '/child', '/teqfw/db/schema/application']);
        assert.deepEqual(evidence.tables.map((item) => [item.sourceRows, item.targetRows]), [[2, 2], [0, 0], [2, 2], [0, 0]]);
        assert.deepEqual(evidence.transformations, [{entity: '/parent', id: 'uppercase-parent-v1'}]);
        assert.equal(evidence.transaction.outcome, 'committed');
        assert.equal((await target.getClient()('teq_parent').where({id: 1}).first()).name, 'FIRST');
        assert.equal(await source.getClient()('teq_parent').count({count: '*'}).first().then((row) => Number(row.count)), 2);
        const index = await target.getClient()('sqlite_master').where({type: 'index', name: 'teq_child_parent_lookup'}).first();
        assert(index);
        assert(Object.isFrozen(evidence));
    });

    it('refuses destructive in-place work without preservation and permits explicitly authorized empty recreation', async () => {
        const connection = await connect();
        const compilation = await targetCompilation();
        await createSource(connection, compilation);

        await assert.rejects(rebuild.exec({
            compilation, mode: 'inPlace', source: connection, sourceId: 'same', target: connection, targetId: 'same',
        }), /verified readable snapshot or explicit discard authorization/);
        assert.equal(await connection.getClient()('teq_parent').count({count: '*'}).first().then((row) => Number(row.count)), 2);

        const evidence = await rebuild.exec({
            authorizeDiscard: true,
            compilation,
            mode: 'inPlace',
            source: connection,
            sourceId: 'same',
            target: connection,
            targetId: 'same',
        });
        assert.equal(evidence.status, 'complete');
        assert(evidence.tables.every((item) => item.status === 'discardAuthorized'));
        assert.equal(await connection.getClient()('teq_parent').count({count: '*'}).first().then((row) => Number(row.count)), 0);
    });

    it('fails and leaves the target unaccepted when a required late index fails after data', async () => {
        const source = await connect();
        const targetConnection = await connect();
        const compilation = await targetCompilation();
        await createSource(source, compilation);
        const failingAdapter = Object.freeze({
            ...adapter,
            addIndex: function () {
                throw new Error('late index failed');
            },
        });
        const target = {
            getDialectAdapter: () => failingAdapter,
            getClient: () => targetConnection.getClient(),
            getSchemaBuilder: () => targetConnection.getSchemaBuilder(),
            startTransaction: (options) => targetConnection.startTransaction(options),
        };

        await assert.rejects(
            rebuild.exec({
                compilation, mode: 'parallel', source, sourceId: 'source', target, targetId: 'failed-target',
            }),
            (error) => {
                assert.equal(error.name, 'RebuildError');
                assert.equal(error.evidence.status, 'failed');
                assert.equal(error.evidence.accepted, false);
                assert.equal(error.evidence.dataComplete, true);
                assert.equal(error.evidence.failures[0].stage, 'afterData');
                assert.equal(error.evidence.tables.length, 4);
                return true;
            },
        );
    });

    it('restores a verified in-place snapshot after destructive recreation', async () => {
        const connection = await connect();
        const compilation = await targetCompilation();
        await createSource(connection, compilation);
        const rows = {
            '/parent': await connection.getClient()('teq_parent').select(),
            '/child': await connection.getClient()('teq_child').select(),
            '/teqfw/db/schema/snapshot': await connection.getClient()('teq_teqfw_db_schema_snapshot').select(),
            '/teqfw/db/schema/application': await connection.getClient()('teq_teqfw_db_schema_application').select(),
        };
        const evidence = await rebuild.exec({
            compilation,
            mode: 'inPlace',
            snapshot: {verified: true, readTable: async ({entity}) => structuredClone(rows[entity])},
            source: connection,
            sourceId: 'same',
            target: connection,
            targetId: 'same',
        });
        assert.equal(evidence.status, 'complete');
        assert.deepEqual(await connection.getClient()('teq_parent').orderBy('id'), rows['/parent']);
        assert.deepEqual(await connection.getClient()('teq_child').orderBy('id'), rows['/child']);
    });

    it('does not finalize caller-owned source or target transactions', async () => {
        const source = await connect();
        const target = await connect();
        const compilation = await targetCompilation();
        await createSource(source, compilation);
        const calls = {sourceCommit: 0, sourceRollback: 0, targetCommit: 0, targetRollback: 0};
        const sourceTransaction = {
            commit: async () => calls.sourceCommit++,
            getKnexTrx: () => source.getClient(),
            rollback: async () => calls.sourceRollback++,
        };
        const targetTransaction = {
            commit: async () => calls.targetCommit++,
            getKnexTrx: () => target.getClient(),
            rollback: async () => calls.targetRollback++,
        };
        const evidence = await rebuild.exec({
            compilation, mode: 'parallel', source, sourceId: 'source', sourceTransaction,
            target, targetId: 'target', targetTransaction,
        });
        assert.equal(evidence.transaction.outcome, 'externalUnchanged');
        assert.deepEqual(calls, {sourceCommit: 0, sourceRollback: 0, targetCommit: 0, targetRollback: 0});
        assert.equal(await target.getClient()('teq_parent').count({count: '*'}).first().then((row) => Number(row.count)), 2);
    });
});
