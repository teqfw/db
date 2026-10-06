import assert from 'node:assert/strict';
import {after, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';
import {identity, identityCompilation, createIdentitySchema, tableFor, personEntity} from '../../../data/Identity.mjs';

const connections = [];
after(async () => { for (const connection of connections) await connection.disconnect(); });
async function connect() {
    const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    connections.push(connection);
    return connection;
}

describe('allocated identity rebuild acceptance', () => {
    it('transfers explicit identities and high-water marks without native generated-state restoration', async () => {
        const source = await connect();
        const target = await connect();
        const adapter = source.getDialectAdapter();
        const sourceCompilation = await identityCompilation(adapter, {namespace: 'asrc'});
        const compilation = await identityCompilation(adapter, {namespace: 'atgt'});
        await createIdentitySchema(source, sourceCompilation);
        const transaction = await source.startTransaction();
        const id = await identity.allocate({compilation: sourceCompilation, transaction, entity: personEntity});
        await transaction.getKnexTrx()(tableFor(sourceCompilation, personEntity)).insert({id});
        // A durably reserved ID is not reused, even if it has no live row.
        await identity.allocate({compilation: sourceCompilation, transaction, entity: personEntity});
        await transaction.commit();
        const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');
        const evidence = await rebuild.exec({mode: 'parallel', source, target, compilation, sourceCompilation, sourceId: 'source', targetId: 'target'});
        assert.equal(evidence.status, 'complete');
        assert.deepEqual(evidence.generatedState, []);
        assert.equal(evidence.identityCounters.find((item) => item.entity === personEntity).value, 2);
        const next = await target.startTransaction();
        assert.equal(await identity.allocate({compilation, transaction: next, entity: personEntity}), 3);
        await next.rollback();
    });

    it('migrates native-generated rows to allocated identities and rejects missing explicit values', async () => {
        const source = await connect();
        const target = await connect();
        const adapter = source.getDialectAdapter();
        const sourceCompilation = await identityCompilation(adapter, {namespace: 'nsrc', mode: 'byDefault'});
        const compilation = await identityCompilation(adapter, {namespace: 'ntgt'});
        await createIdentitySchema(source, sourceCompilation);
        await source.getClient()(tableFor(sourceCompilation, personEntity)).insert({id: 1000});
        const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');
        const result = await rebuild.exec({mode: 'parallel', source, target, compilation, sourceCompilation, sourceId: 'source', targetId: 'target'});
        assert.equal(result.identityCounters.find((item) => item.entity === personEntity).value, 1000);
        const transaction = await target.startTransaction();
        assert.equal(await identity.allocate({compilation, transaction, entity: personEntity}), 1001);
        await transaction.rollback();

        const invalid = await connect();
        await assert.rejects(rebuild.exec({mode: 'parallel', source, target: invalid, compilation, sourceCompilation, sourceId: 'source', targetId: 'invalid',
            transformations: {[personEntity]: {id: 'missing-identity', exec: () => ({})}},
        }), /Required target value/);
    });

    it('leaves unsupported cyclic transfer rules unchanged', async () => {
        const source = await connect();
        const target = await connect();
        const sourceCompilation = await identityCompilation(source.getDialectAdapter(), {self: true, namespace: 'csrc'});
        const compilation = await identityCompilation(target.getDialectAdapter(), {self: true, namespace: 'ctgt'});
        await createIdentitySchema(source, sourceCompilation);
        const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');
        await assert.rejects(rebuild.exec({mode: 'parallel', source, target, compilation, sourceCompilation, sourceId: 'source', targetId: 'target'}), /cycl/i);
        assert.deepEqual(await target.getClient()('sqlite_master').where({type: 'table'}), []);
    });
});
