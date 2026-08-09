import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

const adapters = Object.freeze({
    mysql: await container.get('TeqFw_Db_Back_RDb_Dialect_Mysql$'),
    postgresql: await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$'),
    sqlite: await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$'),
});

describe('Knex dialect core registry projection', () => {
    for (const [dialect, adapter] of Object.entries(adapters)) {
        it(`retains logical storage parameters through explicit ${dialect} bindings`, async () => {
            const string = await adapter.resolveType({
                logicalType: {id: 'core.string', params: {length: 73}},
                storage: {type: 'string', params: {}},
            });
            const decimal = await adapter.resolveType({
                logicalType: {id: 'core.decimal', params: {precision: 14, scale: 5, unsigned: false}},
                storage: {type: 'decimal', params: {}},
            });
            const datetime = await adapter.resolveType({
                logicalType: {id: 'core.datetime', params: {precision: 3, timezone: false}},
                storage: {type: 'datetime', params: {}},
            });

            assert.deepEqual(string.physicalType.args, [73]);
            assert.deepEqual(decimal.physicalType.args, [14, 5]);
            assert.deepEqual(datetime.physicalType.args, [{precision: 3, useTz: false}]);
        });
    }

    it('maps every portable integer width to a registered MySQL physical type', async () => {
        const expected = new Map([[8, 'tinyint'], [16, 'smallint'], [32, 'integer'], [64, 'bigint']]);
        for (const [bits, type] of expected) {
            const value = await adapters.mysql.resolveType({
                logicalType: {id: 'core.integer', params: {bits, unsigned: true}},
            });
            assert.equal(value.physicalType.type, type);
            assert.equal(value.physicalType.unsigned, true);
        }
    });

    it('rejects unsigned core numerics where no exact physical mapping is registered', async () => {
        for (const adapter of [adapters.postgresql, adapters.sqlite]) {
            for (const logicalType of [
                {id: 'core.integer', params: {bits: 32, unsigned: true}},
                {id: 'core.decimal', params: {precision: 10, scale: 2, unsigned: true}},
            ]) {
                const value = await adapter.resolveType({logicalType});
                assert.equal(value.physicalType, undefined);
                assert.deepEqual(value.diagnostics.map((item) => item.code), ['DEM_STORAGE_UNSUPPORTED']);
            }
        }
    });

    it('rejects unknown closed storage parameters, unsupported identity modes, and narrow identities', async () => {
        const storage = await adapters.mysql.resolveType({
            logicalType: {id: 'core.string', params: {length: 12}},
            storage: {type: 'string', params: {raw: 'varchar(12)'}},
        });
        assert.deepEqual(storage.diagnostics.map((item) => item.code), ['DEM_STORAGE_UNSUPPORTED']);

        for (const [bits, mode] of [[32, 'always'], [16, 'byDefault']]) {
            const generation = await adapters.mysql.resolveGeneration({
                generation: {kind: 'core.identity', params: {mode}},
                logicalType: {id: 'core.integer', params: {bits, unsigned: false}},
            });
            assert.equal(generation.descriptor, undefined);
            assert.deepEqual(generation.diagnostics.map((item) => item.code), ['DEM_GENERATION_INVALID']);
        }
    });

    it('rejects MySQL deferrability at adapter compilation boundary', async () => {
        const value = await adapters.mysql.resolveRelation({relation: {deferrable: 'deferred'}});
        assert.equal(value.descriptor, undefined);
        assert.deepEqual(value.diagnostics.map((item) => item.code), ['DEM_CAPABILITY_UNSUPPORTED']);
    });
});
