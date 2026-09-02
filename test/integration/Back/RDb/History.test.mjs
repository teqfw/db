import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
const history = await container.get('TeqFw_Db_Back_RDb_History$');
const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
const builder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder$');
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

async function compilation({withExtra = false} = {}) {
    const entity = (name) => ({
        attr: {id: {type: {id: 'core.identity', params: {}}}, name: {type: {id: 'core.string', params: {length: 32}}}},
        index: {}, relation: {},
    });
    return compile.exec({
        adapter,
        fragments: [{
            declaration: {version: 2, requires: [], refs: {}, package: {}, entity: {
                alpha: entity('alpha'), ...(withExtra ? {beta: entity('beta')} : {}),
            }},
            filename: '/fixture/app/etc/teqfw.schema.json', fragmentId: 'fixture-app', packageName: 'fixture-app',
        }],
        mapEnvelope: {declaration: {version: 2, namespace: 'fixture'}, filename: '/fixture/app/etc/teqfw.schema.map.json', mapId: 'fixture-map', packageName: 'fixture-app'},
    });
}

describe('TeqFw_Db_Back_RDb_History', () => {
    it('deduplicates immutable dialect-independent effective DEM snapshots and tracks an applied attempt', async () => {
        const connection = await connect();
        const target = await compilation();
        await builder.exec({adapter, connection, plan: planner.exec({compilation: target, operation: 'create'})});

        const first = await history.recordSnapshot({compilation: target, connection});
        const duplicate = await history.recordSnapshot({compilation: target, connection});
        assert.equal(duplicate.id, first.id);
        assert.equal(first.fingerprint, target.effective.fingerprint);
        assert.notEqual(first.fingerprint, target.fingerprint);
        assert.equal(first.provenance['/entity/alpha'][0].revision.startsWith('sha256-v1:'), true);
        assert.equal(target.physical.tables.some((table) => table.entity === '/schema/snapshot'), true);
        assert.equal(target.physical.tables.some((table) => table.entity === '/schema/application'), true);

        const attempt = await history.startApplication({compilation: target, connection, targetSnapshotId: first.id});
        assert.equal(attempt.status, 'started');
        const applied = await history.completeApplication({applicationId: attempt.id, compilation: target, connection});
        assert.equal(applied.status, 'applied');
        assert.ok(applied.completedAt);
        await assert.rejects(
            history.failApplication({applicationId: attempt.id, compilation: target, connection}),
            /Only a started schema application may be failed/,
        );
        const last = await history.resolveLastApplied({compilation: target, connection});
        assert.equal(last.application.id, attempt.id);
        assert.equal(last.snapshot.id, first.id);
    });

    it('rejects a claimed applied snapshot when the active catalog does not match its projection', async () => {
        const connection = await connect();
        const source = await compilation();
        const target = await compilation({withExtra: true});
        await builder.exec({adapter, connection, plan: planner.exec({compilation: source, operation: 'create'})});
        const sourceSnapshot = await history.recordSnapshot({compilation: source, connection});
        const initial = await history.startApplication({compilation: source, connection, targetSnapshotId: sourceSnapshot.id});
        await history.completeApplication({applicationId: initial.id, compilation: source, connection});
        const targetSnapshot = await history.recordSnapshot({compilation: target, connection});
        const attempt = await history.startApplication({
            compilation: target, connection, sourceSnapshotId: sourceSnapshot.id, targetSnapshotId: targetSnapshot.id,
        });

        await assert.rejects(
            history.completeApplication({applicationId: attempt.id, compilation: target, connection}),
            (error) => error.name === 'DemCatalogMismatchError'
                && error.diagnostics.some((item) => item.code === 'DEM_CATALOG_TABLE_MISSING' && item.details.table === 'fixture_beta'),
        );
        const failed = await history.failApplication({applicationId: attempt.id, compilation: target, connection});
        assert.equal(failed.status, 'failed');
    });
});
