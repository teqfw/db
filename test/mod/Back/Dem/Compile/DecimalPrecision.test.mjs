import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
const coreValue = await container.get('TeqFw_Db_Back_Dem_Registry_CoreValue$');

function input(value, precision, scale) {
    return {
        adapter: createFakeAdapter(),
        fragments: [{
            declaration: {
                version: 2, package: {}, refs: {}, requires: [],
                entity: {
                    amount: {
                        attr: {
                            value: {
                                default: {kind: 'literal', value},
                                type: {id: 'core.decimal', params: {precision, scale, unsigned: false}},
                            },
                        },
                        index: {}, relation: {},
                    },
                },
            },
            filename: '/fixtures/decimal/schema.json', fragmentId: 'decimal', packageName: 'decimal',
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'decimal'}, filename: '/fixtures/decimal/map.json',
            mapId: 'decimal:map', packageName: 'decimal',
        },
    };
}

describe('exact decimal precision and scale', () => {
    it('counts integer capacity separately from fractional scale', async () => {
        const fractionOnly = {id: 'core.decimal', params: {precision: 3, scale: 3, unsigned: false}};
        assert.equal(coreValue.matches({type: fractionOnly, value: '0.001'}), true);
        await compile.exec(input('0.001', 3, 3));

        const oneIntegerDigit = {id: 'core.decimal', params: {precision: 3, scale: 2, unsigned: false}};
        assert.equal(coreValue.matches({type: oneIntegerDigit, value: '123'}), false);
        await assert.rejects(compile.exec(input('123', 3, 2)), (error) => {
            assert.deepEqual(error.diagnostics.map((item) => item.code), ['DEM_DEFAULT_INVALID']);
            return true;
        });
    });
});
