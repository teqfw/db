import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');

function fragment(fragmentId, declaration) {
    return {
        declaration,
        filename: `/fixtures/${fragmentId}/etc/teqfw.schema.json`,
        fragmentId,
        packageName: fragmentId,
    };
}

function mapEnvelope(declaration = {version: 2, namespace: 'teq'}) {
    return {
        declaration,
        filename: '/fixtures/app/etc/teqfw.schema.map.json',
        mapId: 'app-map',
        packageName: 'app',
    };
}

function simpleEntity(name = 'id') {
    return {
        attr: {[name]: {type: {id: 'core.integer', params: {}}}},
        index: {},
        relation: {},
    };
}

async function compile(fragments, map = mapEnvelope()) {
    return compiler.exec({adapter: createFakeAdapter(), fragments, mapEnvelope: map});
}

describe('TeqFw_Db_Back_Dem_Compile_A_Compose', () => {
    it('composes only disjoint children through shared structural package containers', async () => {
        const first = fragment('first', {
            version: 2, requires: [], entity: {}, refs: {},
            package: {shared: {entity: {alpha: simpleEntity()}, package: {}}},
        });
        const second = fragment('second', {
            version: 2, requires: [], entity: {}, refs: {},
            package: {shared: {entity: {beta: simpleEntity()}, package: {}}},
        });
        const result = await compile([second, first]);

        assert.deepEqual(Object.keys(result.model.package.shared.entity), ['alpha', 'beta']);
        assert.equal(result.provenance['/package/shared/entity/alpha'][0].fragmentId, 'first');
        assert.equal(result.provenance['/package/shared/entity/beta'][0].fragmentId, 'second');
        assert.equal(result.provenance['/package/shared'], undefined);
    });

    it('rejects semantic package metadata co-ownership while retaining all sources', async () => {
        const first = fragment('first', {
            version: 2, requires: [], entity: {}, refs: {},
            package: {shared: {comment: 'First', entity: {alpha: simpleEntity()}, package: {}}},
        });
        const second = fragment('second', {
            version: 2, requires: [], entity: {}, refs: {},
            package: {shared: {comment: 'Second', entity: {beta: simpleEntity()}, package: {}}},
        });

        await assert.rejects(compile([first, second]), (error) => {
            const conflict = error.diagnostics.find((item) => item.path === '/package/shared/comment');
            assert.equal(conflict.code, 'DEM_COMPOSITION_OWNER_CONFLICT');
            assert.deepEqual(conflict.sources.map((item) => item.fragmentId), ['first', 'second']);
            return true;
        });
    });

    it('reports nested semantic collisions and never accepts an exact duplicate winner', async () => {
        const declaration = {
            version: 2, requires: [], package: {}, refs: {},
            entity: {
                shared: {
                    attr: {
                        code: {default: {kind: 'literal', value: 1}, type: {id: 'core.integer', params: {}}},
                        id: {
                            type: {id: 'core.integer', params: {}},
                            storage: {test: {type: 'integer', params: {}}},
                            generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
                        },
                    },
                    index: {pk: {kind: 'primary', keys: [{attr: 'id'}], include: [], options: {}, phase: 'table'}},
                    relation: {self: {action: {}, attrs: ['id'], deferrable: 'notDeferrable', ref: {attrs: ['id'], path: '/shared'}}},
                },
            },
        };

        await assert.rejects(compile([fragment('first', declaration), fragment('second', structuredClone(declaration))]), (error) => {
            const conflicts = error.diagnostics.filter((item) => item.code === 'DEM_COMPOSITION_OWNER_CONFLICT');
            assert.deepEqual(conflicts.map((item) => item.path), [
                '/entity/shared',
                '/entity/shared/attr/code',                '/entity/shared/attr/code/default',
                '/entity/shared/attr/id',
                '/entity/shared/attr/id/generation',
                '/entity/shared/attr/id/storage/test',
                '/entity/shared/index/pk',
                '/entity/shared/relation/self',
            ]);
            assert.ok(conflicts.every((item) => item.sources.length === 2));
            assert.equal('model' in error, false);
            return true;
        });
    });

    it('attaches provenance to every successful semantic node and derived mapping endpoint', async () => {
        const target = fragment('target', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {
                owner: {
                    attr: {id: {type: {id: 'core.integer', params: {}}}},
                    index: {pk: {kind: 'primary', keys: [{attr: 'id'}], include: [], options: {}, phase: 'table'}},
                    relation: {},
                },
            },
        });
        const source = fragment('source', {
            version: 2, requires: [], package: {}, refs: {'/external': ['external_id']},
            entity: {
                item: {
                    attr: {
                        owner_id: {
                            type: {id: 'core.integer', params: {}},
                            storage: {test: {type: 'integer', params: {}}},
                            default: {kind: 'literal', value: 1},
                        },
                    },
                    index: {
                        idx: {
                            kind: 'index', method: 'provider.method', keys: [{attr: 'owner_id'}],
                            include: [], options: {}, phase: 'afterRelations',
                        },
                    },
                    relation: {
                        owner: {
                            attrs: ['owner_id'], ref: {path: '/external', attrs: ['external_id']},
                            action: {}, deferrable: 'notDeferrable',
                        },
                    },
                },
            },
        });
        const map = mapEnvelope({
            version: 2, namespace: 'teq', deprecated: {},
            ref: {source: {'/external': {path: '/owner', attrs: {external_id: 'id'}}}},
        });
        const result = await compile([source, target], map);
        const paths = [
            '/entity/item',
            '/entity/item/attr/owner_id',
            '/entity/item/attr/owner_id/default',
            '/entity/item/attr/owner_id/storage/test',
            '/entity/item/index/idx',
            '/entity/item/relation/owner',
        ];

        for (const path of paths) assert.ok(result.provenance[path]?.length > 0, path);
        assert.deepEqual(
            result.provenance['/entity/item/relation/owner'].map((item) => item.fragmentId),
            ['app-map', 'source'],
        );
    });

    it('never applies another owner map entry to an unresolved external relation', async () => {
        const target = fragment('target', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {owner: simpleEntity('id')},
        });
        const source = fragment('source', {
            version: 2, requires: [], package: {}, refs: {'/external': ['id']},
            entity: {
                item: {
                    attr: {owner_id: {type: {id: 'core.integer', params: {}}}},
                    index: {},
                    relation: {
                        owner: {
                            attrs: ['owner_id'], ref: {path: '/external', attrs: ['id']},
                            action: {}, deferrable: 'notDeferrable',
                        },
                    },
                },
            },
        });
        const map = mapEnvelope({
            version: 2, namespace: 'teq', deprecated: {},
            ref: {another: {'/external': {path: '/owner', attrs: {}}}},
        });

        await assert.rejects(compile([source, target], map), (error) => {
            const missing = error.diagnostics.find((item) => item.code === 'DEM_REFERENCE_MAP_MISSING');
            assert.equal(missing.details.owner, 'source');
            assert.deepEqual(missing.sources.map((item) => item.fragmentId), ['source']);
            return true;
        });
    });
});
