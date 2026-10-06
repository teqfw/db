import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {createHash} from 'node:crypto';
import {container} from '../../../TestEnv.mjs';
import {identity, identityCompilation, createIdentitySchema, tableFor, personEntity, emailEntity, counterEntity} from '../../../data/Identity.mjs';

const connections = [];
afterEach(async () => { while (connections.length) await connections.pop().disconnect(); });

async function setup(options = {}) {
    const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    connections.push(connection);
    const compilation = await identityCompilation(connection.getDialectAdapter(), options);
    await createIdentitySchema(connection, compilation);
    return {connection, compilation};
}

describe('allocated identity on SQLite', () => {
    it('persists a non-null self-reference and cross-package reference in one caller-owned transaction', async () => {
        const {connection, compilation} = await setup({self: true});
        const transaction = await connection.startTransaction();
        const knex = transaction.getKnexTrx();
        const id = await identity.allocate({compilation, transaction, entity: personEntity});
        await knex(tableFor(compilation, personEntity)).insert({id, parent_ref: id});
        const email = await identity.allocate({compilation, transaction, entity: emailEntity});
        await knex(tableFor(compilation, emailEntity)).insert({id: email, person_ref: id});
        assert.equal(knex.isCompleted(), false);
        await transaction.commit();
        assert.deepEqual(await connection.getClient()(tableFor(compilation, personEntity)).first(), {id, parent_ref: id});
        assert.equal(email, 1);
    });

    it('requires an explicit identity for both supported integer widths', async () => {
        for (const bits of [32, 64]) {
            const {connection, compilation} = await setup({bits});
            await assert.rejects(connection.getClient()(tableFor(compilation, personEntity)).insert({}), /NOT NULL/);
        }
    });

    it('serializes overlapping allocation calls in one transaction and never reuses committed high-water marks', async () => {
        const {connection, compilation} = await setup();
        const transaction = await connection.startTransaction();
        const independentService = await container.get('TeqFw_Db_Back_RDb_Identity$$');
        const values = await Promise.all(Array.from({length: 10}, (_, index) => (index % 2 ? independentService : identity)
            .allocate({compilation, transaction, entity: personEntity})));
        assert.deepEqual(values, Array.from({length: 10}, (_, i) => i + 1));
        await transaction.commit();
        const next = await connection.startTransaction();
        assert.equal(await identity.allocate({compilation, transaction: next, entity: personEntity}), 11);
        await next.rollback();
    });

    it('rolls back counters with domain writes and keeps the outer transaction usable after rejected input', async () => {
        const {connection, compilation} = await setup();
        const transaction = await connection.startTransaction();
        await assert.rejects(identity.allocate({compilation, transaction, entity: 'raw_table; drop table users'}), /canonical entity/);
        const id = await identity.allocate({compilation, transaction, entity: personEntity});
        await transaction.getKnexTrx()(tableFor(compilation, personEntity)).insert({id});
        await transaction.rollback();
        assert.deepEqual(await connection.getClient()(tableFor(compilation, personEntity)), []);
        assert.deepEqual(await connection.getClient()(tableFor(compilation, counterEntity)), []);
        const next = await connection.startTransaction();
        assert.equal(await identity.allocate({compilation, transaction: next, entity: personEntity}), id);
        await next.commit();
        await assert.rejects(identity.allocate({compilation, transaction: next, entity: personEntity}), /active caller-owned/);
    });

    it('rejects missing transactions, native-generation entities, and missing counter fragments', async () => {
        const {connection, compilation} = await setup();
        await assert.rejects(identity.allocate({compilation, entity: personEntity}), /active caller-owned/);
        await assert.rejects(identity.allocate({compilation: {...compilation}, entity: personEntity}), /successful DEM compilation/);
        const adapter = connection.getDialectAdapter();
        const native = await identityCompilation(adapter, {mode: 'byDefault'});
        await assert.rejects(identity.allocate({compilation: native, entity: personEntity}), /canonical entity/);
        const missing = await identityCompilation(adapter, {platform: false});
        await assert.rejects(identity.allocate({compilation: missing, entity: personEntity}), /identitycounter DEM/);
        const transaction = await connection.startTransaction();
        const pg = await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$');
        const wrongDialect = await identityCompilation(pg);
        await assert.rejects(identity.allocate({compilation: wrongDialect, transaction, entity: personEntity}), /match the compiled/);
        assert.deepEqual(await transaction.getKnexTrx()(tableFor(compilation, counterEntity)), []);
        await transaction.rollback();
    });

    it('raises imported stale or missing counters and preserves counter values above live row IDs', async () => {
        const {connection, compilation} = await setup();
        const transaction = await connection.startTransaction();
        const knex = transaction.getKnexTrx();
        await knex(tableFor(compilation, personEntity)).insert({id: 500});
        const evidence = await identity.synchronize({compilation, transaction});
        assert.equal(evidence.find((item) => item.entity === personEntity).value, 500);
        assert.equal(await identity.allocate({compilation, transaction, entity: personEntity}), 501);
        await knex(tableFor(compilation, personEntity)).delete();
        assert.equal(await identity.allocate({compilation, transaction, entity: personEntity}), 502);
        await transaction.commit();
    });

    it('fails on exhausted or unsafe counter state without finalizing the caller transaction', async () => {
        for (const [bits, value, message] of [[32, 2147483647, /exhausted/], [64, '9007199254740992', /safe integers/]]) {
            const {connection, compilation} = await setup({bits});
            const transaction = await connection.startTransaction();
            await transaction.getKnexTrx()(tableFor(compilation, counterEntity)).insert({
                scope: createHash('sha256').update(personEntity).digest('hex'), entity_path: personEntity, value,
            });
            await assert.rejects(identity.allocate({compilation, transaction, entity: personEntity}), message);
            assert.equal(transaction.getKnexTrx().isCompleted(), false);
            await transaction.rollback();
        }
    });

    it('allocates the last exact value without overflowing either supported integer range', async () => {
        for (const [bits, limit] of [[32, 2147483647], [64, Number.MAX_SAFE_INTEGER]]) {
            const {connection, compilation} = await setup({bits});
            const transaction = await connection.startTransaction();
            await transaction.getKnexTrx()(tableFor(compilation, counterEntity)).insert({
                scope: createHash('sha256').update(personEntity).digest('hex'), entity_path: personEntity, value: limit - 1,
            });
            assert.equal(await identity.allocate({compilation, transaction, entity: personEntity}), limit);
            await assert.rejects(identity.allocate({compilation, transaction, entity: personEntity}), /exhausted/);
            await transaction.rollback();
        }
    });

    it('detects counter scope corruption and leaves invalid persisted counter values unchanged', async () => {
        const {connection, compilation} = await setup();
        const transaction = await connection.startTransaction();
        const scope = createHash('sha256').update(personEntity).digest('hex');
        const counter = tableFor(compilation, counterEntity);
        await transaction.getKnexTrx()(counter).insert({scope, entity_path: '/wrong/entity', value: 7});
        await assert.rejects(identity.allocate({compilation, transaction, entity: personEntity}), /scope integrity/);
        assert.equal((await transaction.getKnexTrx()(counter).first()).entity_path, '/wrong/entity');
        await transaction.getKnexTrx()(counter).update({entity_path: personEntity, value: -1});
        await assert.rejects(identity.allocate({compilation, transaction, entity: personEntity}), /safe integers/);
        assert.equal((await transaction.getKnexTrx()(counter).first()).value, -1);
        await transaction.rollback();
    });

    it('uses the caller transaction for all allocated history operations and catalog verification', async () => {
        const {connection, compilation} = await setup();
        const history = await container.get('TeqFw_Db_Back_RDb_History$');
        const transaction = await connection.startTransaction();
        const snapshot = await history.recordSnapshot({compilation, connection, transaction});
        const attempt = await history.startApplication({compilation, connection, transaction, targetSnapshotId: snapshot.id});
        await history.completeApplication({compilation, connection, transaction, applicationId: attempt.id});
        assert.equal((await history.resolveLastApplied({compilation, connection, transaction})).snapshot.id, snapshot.id);
        assert.equal(transaction.getKnexTrx().isCompleted(), false);
        await transaction.rollback();
        assert.deepEqual(await connection.getClient()(tableFor(compilation, '/teqfw/db/schema/snapshot')), []);
        assert.deepEqual(await connection.getClient()(tableFor(compilation, counterEntity)), []);
    });
});
