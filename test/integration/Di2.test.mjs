import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {dirname, join} from 'node:path';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';
import Container from '@teqfw/di';
import NamespaceRegistry from '@teqfw/di/node/registry/namespace';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function createContainer() {
    const container = new Container();
    container.addNamespaceRoot('TeqFw_Db_', join(root, 'src'), '.mjs');
    container.addNamespaceRoot('TeqFw_Cfg_', join(root, 'node_modules/@teqfw/cfg/src'), '.mjs');
    container.addNamespaceRoot('TeqFw_Log_', join(root, 'node_modules/@teqfw/log/src'), '.mjs');
    return container;
}

describe('@teqfw/db with @teqfw/di 2.x', () => {
    it('publishes canonical namespace metadata for db and cfg', async () => {
        const namespaces = await new NamespaceRegistry({fs, path, appRoot: root}).build();
        const prefixes = namespaces.map((item) => item.prefix);
        assert(prefixes.includes('TeqFw_Db_'));
        assert(prefixes.includes('TeqFw_Cfg_'));
    });

    it('resolves a named DTO factory and its complete dependency graph', async () => {
        const container = createContainer();
        const factory = await container.get('TeqFw_Db_Back_Dto_Dem__Factory$');
        const dto = factory.create({
            entity: {
                user: {
                    attr: {
                        id: {type: 'id'},
                    },
                },
            },
        });

        assert.deepEqual(Object.keys(dto.entity), ['user']);
        assert.equal(dto.entity.user.attr.id.type, 'id');
        assert.equal(Object.isFrozen(factory), true);
    });

    it('builds an immutable Knex configuration from the cfg namespace', async () => {
        const container = createContainer();
        const loader = await container.get('TeqFw_Cfg_Loader$');
        const source = await container.get('TeqFw_Cfg_Source_Object$');
        await loader.load([source.create({
            TEQFW_DB__CLIENT: 'sqlite3',
            TEQFW_DB__FILENAME: ':memory:',
            TEQFW_DB__USE_NULL_AS_DEFAULT: 'true',
            TEQFW_DB__REPORTING_CLIENT: 'pg',
            TEQFW_DB__REPORTING_DATABASE: 'reporting',
        }, 'db-test')]);

        const config = await container.get('TeqFw_Db_Back_Config$');
        assert.deepEqual(config.get(), {
            client: 'sqlite3',
            connection: {filename: ':memory:'},
            useNullAsDefault: true,
        });
        assert.equal(Object.isFrozen(config.get()), true);
        assert.equal(Object.isFrozen(config.get().connection), true);
        assert.strictEqual(config.getLocal('@teqfw/db'), config.get());
        assert.deepEqual(config.get('reporting'), {
            client: 'pg',
            connection: {database: 'reporting'},
        });
        assert.equal(Object.isFrozen(config.get('reporting').connection), true);
        assert.strictEqual(config.get('REPORTING'), config.get('reporting'));
        assert.strictEqual(config.get('DEFAULT'), config.get());
    });

    it('rejects malformed package-owned structured configuration', async () => {
        const container = createContainer();
        const loader = await container.get('TeqFw_Cfg_Loader$');
        const source = await container.get('TeqFw_Cfg_Source_Object$');
        await loader.load([source.create({TEQFW_DB__EXTRA: 'not-json'}, 'invalid-db-test')]);
        const config = await container.get('TeqFw_Db_Back_Config$');
        assert.throws(() => config.get(), /TEQFW_DB__EXTRA must contain valid JSON/);
    });

    it('merges specialized EXTRA fields while common parameters remain explicit', async () => {
        const container = createContainer();
        const loader = await container.get('TeqFw_Cfg_Loader$');
        const source = await container.get('TeqFw_Cfg_Source_Object$');
        await loader.load([source.create({
            TEQFW_DB__CLIENT: 'pg',
            TEQFW_DB__HOST: 'db.internal',
            TEQFW_DB__EXTRA: {
            acquireConnectionTimeout: 5000,
            pool: {min: 1, max: 4},
                connection: {ssl: true},
            },
        }, 'extra-db-test')]);
        const config = await container.get('TeqFw_Db_Back_Config$');
        assert.deepEqual(config.get(), {
            client: 'pg',
            acquireConnectionTimeout: 5000,
            pool: {min: 1, max: 4},
            connection: {ssl: true, host: 'db.internal'},
        });
        assert.equal(Object.isFrozen(config.get().pool), true);
        assert.equal(Object.isFrozen(config.get().connection), true);
    });

    it('resolves a real connection graph and executes a SQLite transaction', async () => {
        const container = createContainer();
        const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
        await connection.init({
            client: 'sqlite3',
            connection: {filename: ':memory:'},
            useNullAsDefault: true,
        });

        const trx = await connection.startTransaction();
        await trx.raw('select 1');
        await trx.commit();
        await connection.disconnect();
    });
});
