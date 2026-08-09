import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');

function input(index) {
    return {
        adapter: createFakeAdapter(),
        fragments: [{
            declaration: {
                version: 2, package: {}, refs: {}, requires: [],
                entity: {
                    item: {
                        attr: {
                            code: {type: {id: 'core.integer', params: {}}},
                            id: {type: {id: 'core.integer', params: {}}},
                        },
                        index,
                        relation: {},
                    },
                },
            },
            filename: '/fixtures/primary/schema.json', fragmentId: 'primary', packageName: 'primary',
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'primary'}, filename: '/fixtures/primary/map.json',
            mapId: 'primary:map', packageName: 'primary',
        },
    };
}

const primary = (attr) => ({include: [], keys: [{attr}], kind: 'primary', options: {}, phase: 'table'});

describe('primary index cardinality', () => {
    it('accepts zero and rejects multiple primary indexes per the architecture at-most-one invariant', async () => {
        await compile.exec(input({}));
        await assert.rejects(compile.exec(input({one: primary('id'), two: primary('code')})), (error) => {
            const diagnostic = error.diagnostics.find((item) => item.path === '/entity/item/index');
            assert.equal(diagnostic.code, 'DEM_INDEX_INVALID');
            assert.equal(diagnostic.details.primaryCount, 2);
            return true;
        });
    });
});
