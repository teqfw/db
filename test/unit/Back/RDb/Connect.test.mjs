import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/Connect.mjs';
import Registry from '../../../../src/Back/RDb/Dialect/Registry.mjs';

const adapters = {
    mysql: Object.freeze({describe: () => ({id: 'mysql'})}),
    postgresql: Object.freeze({describe: () => ({id: 'postgresql'})}),
    sqlite: Object.freeze({describe: () => ({id: 'sqlite'})}),
};

for (const client of ['pg', 'pg-native', 'postgres', 'postgresql', 'mysql', 'mysql2', 'mariadb', 'sqlite3', 'better-sqlite3']) {
    for (const fails of [false, true]) {
        test(`connection diagnostics select ${client} fields on setup ${fails ? 'failure' : 'success'}`, async () => {
            const sqlite = client.includes('sqlite');
            const cfg = {
                client,
                connection: {
                    filename: 'var/development.sqlite',
                    database: 'application', host: '127.0.0.1', user: 'operator',
                    password: 'secret-password', ssl: {key: 'secret-private-key'},
                    connectionString: 'postgres://operator:secret-url-password@localhost/application',
                },
            };
            const before = structuredClone(cfg);
            const failure = Object.assign(new Error('Driver error: secret-password'), {config: cfg});
            const records = [];
            const knex = {schema: {}};
            let received;
            const connection = new subject({
                _dialects: new Registry(adapters),
                logger: {forSource(source) {
                    assert.equal(source, 'TeqFw_Db_Back_RDb_Connect');
                    return {
                        info: (...args) => records.push({level: 'info', args}),
                        error: (...args) => records.push({level: 'error', args}),
                    };
                }},
                _resolver: {}, Trans: class {},
                knexFactory: async (config) => {
                    received = config;
                    if (fails) throw failure;
                    return knex;
                },
            });
            if (fails) {
                await assert.rejects(connection.init(cfg), (err) => err === failure);
                assert.throws(() => connection.getDialectAdapter(), /not initialized/);
            } else {
                await connection.init(cfg);
                assert.equal(connection.getClient(), knex);
                assert.equal(connection.getDialectAdapter(), sqlite ? adapters.sqlite
                    : client.startsWith('pg') || client.startsWith('postgres') ? adapters.postgresql : adapters.mysql);
            }
            assert.deepEqual(cfg, before);
            assert.deepEqual(received, cfg);
            assert.notEqual(received, cfg);
            const description = sqlite ? `client "${client}", file "var/development.sqlite"`
                : `client "${client}", database "application", host "127.0.0.1", user "operator"`;
            assert.deepEqual(records, [{
                level: fails ? 'error' : 'info',
                args: [`${fails ? 'Cannot setup' : 'Setup'} connection to DB ${description}.`],
            }]);
            assert.doesNotMatch(JSON.stringify(records), /secret-|connectionString|ssl/);
        });
    }
}

test('opaque connection URLs and nested values are not serialized in diagnostics', async () => {
    const records = [];
    const connection = new subject({
        _dialects: new Registry(adapters),
        logger: {forSource: () => ({info: (...args) => records.push(args)})},
        _resolver: {}, Trans: class {}, knexFactory: () => ({}),
    });
    for (const config of [
        {client: 'pg', connection: 'postgres://user:secret@host/db'},
        {client: 'pg', connection: {database: {password: 'secret'}}},
        {client: 'pg'},
    ]) await connection.init(config);
    assert.equal(records.length, 3);
    for (const args of records) assert.deepEqual(args, [
        'Setup connection to DB client "pg", database (default), host (default), user (default).',
    ]);
});
