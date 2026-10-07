import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Cli/Import.mjs';

test('Back/Cli/Import.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

test('native sequence restoration uses the active import transaction', async () => {
    const transactionSchema = {};
    const events = [];
    const trx = {
        isMariaDB: () => false, isPostgres: () => true,
        getKnexTrx: () => ({schema: transactionSchema}),
        async commit() { events.push('commit'); },
        async rollback() { events.push('rollback'); },
    };
    const serials = {sequence: 7};
    const command = subject({
        DEF: {CLI_PREFIX: 'db'},
        logger: {forSource: () => ({info() {}, error(message, detail) {throw detail?.err ?? new Error(message);}})},
        fCommand: {create: () => ({opts: []})}, fOpt: {create: () => ({})},
        app: {async stop() {events.push('stop');}},
        conn: {async startTransaction() {return trx;}, getSchemaBuilder() {throw new Error('Outside transaction');}},
        util: {async pgSerialsSet(schema, values) {
            assert.equal(schema, transactionSchema);
            assert.equal(values, serials);
            events.push('restore');
        }},
        utilFile: {readJson: () => ({tables: {}, serials})},
        transform: {prepareSerials: (values) => values},
        aDemTables: {async act() {return [];}},
    });
    await command.action({file: '/fixture/import.json'});
    assert.deepEqual(events, ['restore', 'commit', 'stop']);
});
