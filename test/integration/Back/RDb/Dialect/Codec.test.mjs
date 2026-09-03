import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

const adapters = Object.freeze({
    mysql: await container.get('TeqFw_Db_Back_RDb_Dialect_Mysql$'),
    postgresql: await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$'),
    sqlite: await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$'),
});

const column = (id, params = {}) => ({logicalType: {id, params}});

describe('dialect value codecs', () => {
    for (const [dialect, adapter] of Object.entries(adapters)) {
        it(`canonicalizes portable values for ${dialect}`, () => {
            const instant = new Date('2026-08-09T10:11:12.345Z');
            if (dialect !== 'mysql') {
                assert.equal(adapter.encodeValue({column: column('core.date'), value: instant}), '2026-08-09');
                assert.equal(adapter.encodeValue({column: column('core.datetime'), value: instant}), instant.toISOString());
                assert.equal(adapter.decodeValue({column: column('core.datetime'), value: instant}), instant.toISOString());
            }
            assert.equal(adapter.decodeValue({column: column('core.date'), value: '2026-08-09T00:00:00.000Z'}), '2026-08-09');
            assert.equal(adapter.decodeValue({column: column('core.boolean'), value: 0}), false);
            assert.equal(adapter.decodeValue({column: column('core.boolean'), value: 1}), true);
            assert.equal(adapter.decodeValue({column: column('core.integer'), value: '42'}), 42);
            assert.equal(adapter.decodeValue({column: column('core.integer'), value: '9007199254740993'}), '9007199254740993');
            assert.deepEqual(adapter.decodeValue({column: column('core.json'), value: '{"ok":true}'}), {ok: true});
        });
    }

    it('preserves MySQL wall-clock date and datetime values', () => {
        const value = new Date(2026, 7, 9, 10, 11, 12, 345);
        assert.equal(adapters.mysql.encodeValue({column: column('core.date'), value}), '2026-08-09');
        assert.equal(adapters.mysql.decodeValue({column: column('core.date'), value}), '2026-08-09');
        assert.equal(adapters.mysql.encodeValue({column: column('core.datetime'), value}), '2026-08-09 10:11:12.345');
        assert.equal(adapters.mysql.decodeValue({column: column('core.datetime'), value}), '2026-08-09T10:11:12.345');
        assert.equal(adapters.mysql.encodeValue({column: column('core.datetime'), value: '2026-08-09T10:11:12'}),
            '2026-08-09 10:11:12');
    });

    it('keeps PostgreSQL pgvector dispatch separate from portable codecs', () => {
        const vector = column('core.vector', {dimensions: 2, element: 'float', sparse: false});
        assert.equal(adapters.postgresql.encodeValue({column: vector, value: [1, 2]}), '[1,2]');
        assert.deepEqual(adapters.postgresql.decodeValue({column: vector, value: '[1,2]'}), [1, 2]);
    });
});
