import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

const integer = () => ({type: {id: 'core.integer', params: {bits: 32, unsigned: false}}});
const primary = () => ({include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'});

describe('physical schema name registry', () => {
    it('projects every package-path segment into a table name while allowing snake_case attributes', async () => {
        const entity = () => ({
            attr: {id: integer(), owner_id: integer()}, index: {pk: primary()}, relation: {},
        });
        const declaration = {
            version: 2, package: {
                pde: {entity: {}, package: {
                    runtime: {
                        entity: {delegation: entity()},
                        package: {
                            access: {entity: {token: entity()}, package: {}},
                            audit: {entity: {event: entity()}, package: {}},
                            owner: {entity: {session: entity()}, package: {}},
                        },
                    },
                }},
            }, refs: {}, requires: [],
        };

        const result = await compile.exec({
            adapter,
            fragments: [{
                declaration, filename: '/fixtures/names/schema.json', fragmentId: 'names', packageName: 'names',
            }],
            mapEnvelope: {
                declaration: {version: 2}, filename: '/fixtures/names/map.json',
                mapId: 'names:map', packageName: 'names',
            },
        });

        assert.deepEqual(
            Object.fromEntries(result.physical.tables.map((table) => [table.entity, table.name])),
            {
                '/pde/runtime/access/token': 'pde_runtime_access_token',
                '/pde/runtime/audit/event': 'pde_runtime_audit_event',
                '/pde/runtime/delegation': 'pde_runtime_delegation',
                '/pde/runtime/owner/session': 'pde_runtime_owner_session',
            },
        );
        assert(result.model.package.pde.package.runtime.package.owner.entity.session.attr.owner_id);
    });

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
