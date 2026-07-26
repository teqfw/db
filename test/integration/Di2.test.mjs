import assert from 'node:assert/strict';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';
import Container from '@teqfw/di';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function createContainer() {
    const container = new Container();
    container.addNamespaceRoot('TeqFw_Db_', join(root, 'src'), '.mjs');
    container.addNamespaceRoot('TeqFw_Log_', join(root, 'node_modules/@teqfw/log/src'), '.mjs');
    return container;
}

describe('@teqfw/db with @teqfw/di 2.x', () => {
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
