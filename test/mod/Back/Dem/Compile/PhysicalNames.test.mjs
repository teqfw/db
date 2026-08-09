import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

const integer = () => ({type: {id: 'core.integer', params: {bits: 32, unsigned: false}}});
const primary = () => ({include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'});

describe('physical schema name registry', () => {
    it('rejects an index name that collides with a generated relation constraint name', async () => {
        const declaration = {
            version: 2, package: {}, refs: {}, requires: [],
            entity: {
                child: {
                    attr: {id: integer(), parent_id: integer()},
                    index: {
                        fk_parent: {
                            include: [], keys: [{attr: 'parent_id'}], kind: 'index', method: 'core.btree',
                            options: {}, phase: 'afterRelations',
                        },
                        pk: primary(),
                    },
                    relation: {
                        parent: {
                            action: {}, attrs: ['parent_id'], deferrable: 'notDeferrable',
                            ref: {attrs: ['id'], path: '/parent'},
                        },
                    },
                },
                parent: {attr: {id: integer()}, index: {pk: primary()}, relation: {}},
            },
        };

        await assert.rejects(compile.exec({
            adapter,
            fragments: [{
                declaration, filename: '/fixtures/names/schema.json', fragmentId: 'names', packageName: 'names',
            }],
            mapEnvelope: {
                declaration: {version: 2, namespace: 'app'}, filename: '/fixtures/names/map.json',
                mapId: 'names:map', packageName: 'names',
            },
        }), (error) => {
            const collision = error.diagnostics.find((item) => item.code === 'DEM_PHYSICAL_NAME_COLLISION');
            assert(collision);
            assert.deepEqual(collision.details.paths, [
                '/entity/child/index/fk_parent',
                '/entity/child/relation/parent',
            ]);
            return true;
        });
    });
});
