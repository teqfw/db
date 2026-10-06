import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it} from 'node:test';
import {container} from '../TestEnv.mjs';
import {importIdentityRows} from './IdentityImport.mjs';
import {identity, identityCompilation, createIdentitySchema, tableFor, personEntity, emailEntity, counterEntity} from './Identity.mjs';

/** Exercise actual engines and independent connections, with deterministic lock overlap. */
export function identityConformance(label, config, namespace) {
    describe(`allocated identity conformance: ${label}`, () => {
        it('keeps committed scopes unique under concurrent first use, preserves rollback and history, and survives reconnection', async () => {
            const directory = config.client === 'sqlite3' ? await mkdtemp(join(tmpdir(), 'teqfw-identity-')) : null;
            const effective = directory ? {...config, connection: {filename: join(directory, 'db.sqlite')}} : config;
            const connections = [];
            let compilation;
            const transactions = [];
            async function start(connection) {
                const transaction = await connection.startTransaction();
                transactions.push(transaction);
                return transaction;
            }
            async function connect() {
                const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
                await connection.init(effective);
                connections.push(connection);
                if (directory) await connection.getClient().raw('PRAGMA busy_timeout = 5000');
                return connection;
            }
            try {
                const first = await connect();
                const second = await connect();
                compilation = await identityCompilation(first.getDialectAdapter(), {namespace, self: true});
                await createIdentitySchema(first, compilation);
                const person = tableFor(compilation, personEntity);
                const email = tableFor(compilation, emailEntity);
                const transaction = await start(first);
                const allocated = await identity.allocate({compilation, transaction, entity: personEntity});
                await transaction.getKnexTrx()(person).insert({id: allocated, parent_ref: allocated});
                assert.equal(transaction.getKnexTrx().isCompleted(), false);

                // Start a genuinely overlapping transaction through a different connection.
                const contender = await start(second);
                if (!directory) await contender.getKnexTrx()(tableFor(compilation, counterEntity)).select();
                let finished = false;
                const competing = identity.allocate({compilation, transaction: contender, entity: personEntity})
                    .then((id) => {finished = true; return id;});
                // The first transaction still holds the counter lock.
                await new Promise((resolve) => setTimeout(resolve, 100));
                assert.equal(finished, false);
                await transaction.commit();
                const nextId = await competing;
                assert.equal(nextId, allocated + 1);
                await contender.getKnexTrx()(person).insert({id: nextId, parent_ref: nextId});
                const emailId = await identity.allocate({compilation, transaction: contender, entity: emailEntity});
                assert.equal(emailId, 1);
                await contender.getKnexTrx()(email).insert({id: emailId, person_ref: nextId});
                await contender.commit();
                if (!directory) {
                    const holder = await start(first);
                    const reservation = await identity.allocate({compilation, transaction: holder, entity: emailEntity});
                    const existing = await start(second);
                    await existing.getKnexTrx()(tableFor(compilation, counterEntity)).select();
                    const waiting = identity.allocate({compilation, transaction: existing, entity: emailEntity});
                    await holder.commit();
                    assert.equal(await waiting, reservation + 1);
                    await existing.commit();
                }

                const rollback = await start(first);
                const reverted = await identity.allocate({compilation, transaction: rollback, entity: personEntity});
                await rollback.getKnexTrx()(person).insert({id: reverted, parent_ref: reverted});
                await rollback.rollback();
                assert.equal((await first.getClient()(person)).length, 2);
                const rows = await first.getClient()(person).orderBy('id');
                assert.deepEqual(rows.map((row) => Number(row.id)), [allocated, nextId]);
                assert.equal(rows.every((row) => String(row.id) === String(row.parent_ref)), true);

                await first.disconnect();
                const reopened = await connect();
                const restarted = await start(reopened);
                assert.equal(await identity.allocate({compilation, transaction: restarted, entity: personEntity}), reverted);
                await restarted.commit();
                const history = await container.get('TeqFw_Db_Back_RDb_History$');
                const snapshot = await history.recordSnapshot({compilation, connection: reopened});
                const attempt = await history.startApplication({compilation, connection: reopened, targetSnapshotId: snapshot.id});
                assert.equal(Number(attempt.id), 1);
                await history.completeApplication({compilation, connection: reopened, applicationId: attempt.id});
                assert.equal((await history.resolveLastApplied({compilation, connection: reopened})).application.status, 'applied');

                const external = await start(reopened);
                await history.recordSnapshot({compilation, connection: reopened, transaction: external});
                const pending = await history.startApplication({compilation, connection: reopened, transaction: external,
                    sourceSnapshotId: snapshot.id, targetSnapshotId: snapshot.id});
                await history.completeApplication({compilation, connection: reopened, transaction: external, applicationId: pending.id});
                assert.equal(external.getKnexTrx().isCompleted(), false);
                // Allocated columns never produce native sequence-restoration evidence.
                assert.deepEqual(await reopened.getDialectAdapter().restoreGeneratedState({
                    tables: compilation.physical.tables, transaction: external,
                }), []);
                await external.rollback();
                const applications = await reopened.getClient()(tableFor(compilation, '/teqfw/db/schema/application'));
                assert.equal(applications.length, 1);

                await importIdentityRows(reopened, compilation, {tables: {[person]: [{id: 999, parent_ref: 999}]}, serials: {obsolete_native_sequence: 999}});
                const imported = await start(reopened);
                assert.equal(await identity.allocate({compilation, transaction: imported, entity: personEntity}), 1000);
                await imported.rollback();

                // The primary key is ordinary, including SQLite's 32-bit form.
                const ddl = await reopened.getClient()(tableFor(compilation, counterEntity)).count({count: '*'}).first();
                assert.ok(Number(ddl.count) >= 4);
            } finally {
                for (const transaction of transactions) {
                    if (!transaction.getKnexTrx().isCompleted()) await transaction.rollback();
                }
                // Use a fresh connection because an earlier one was intentionally disconnected.
                if (compilation && !directory) {
                    const cleanup = await connect();
                    try {
                        const knex = cleanup.getClient();
                        await knex.schema.dropTableIfExists(tableFor(compilation, emailEntity));
                        await knex.schema.dropTableIfExists(tableFor(compilation, personEntity));
                        await knex.schema.dropTableIfExists(tableFor(compilation, '/teqfw/db/schema/application'));
                        await knex.schema.dropTableIfExists(tableFor(compilation, '/teqfw/db/schema/snapshot'));
                        await knex.schema.dropTableIfExists(tableFor(compilation, counterEntity));
                    } finally { await cleanup.disconnect(); }
                }
                for (const connection of connections) await connection.disconnect();
                if (directory) await rm(directory, {recursive: true, force: true});
            }
        });
    });
}
