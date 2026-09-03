import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');
const dialectAdapters = Object.freeze({
    postgresql: await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$'),
    sqlite: await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$'),
});

function fragment(fragmentId, declaration, filename = `/fixtures/${fragmentId}/etc/teqfw.schema.json`) {
    return {declaration, filename, fragmentId, packageName: fragmentId};
}

function mapEnvelope(declaration = {version: 2, namespace: 'teq'}) {
    return {
        declaration,
        filename: '/fixtures/app/etc/teqfw.schema.map.json',
        mapId: 'app-map',
        packageName: 'app',
    };
}

function primary(attr = 'id') {
    return {
        kind: 'primary',
        keys: [{attr}],
        include: [],
        options: {},
        phase: 'table',
    };
}

describe('TeqFw_Db_Back_Dem_Compile', () => {
    it('rejects unversioned declarations and maps', async () => {
        await assert.rejects(
            compiler.exec({
                adapter: createFakeAdapter(),
                fragments: [fragment('app', {entity: {}, package: {}, refs: {}, requires: []})],
                mapEnvelope: mapEnvelope({namespace: 'teq'}),
            }),
            (error) => {
                const versions = error.diagnostics.filter((item) => item.code === 'DEM_DECLARATION_VERSION_UNSUPPORTED');
                assert.deepEqual(versions.map((item) => item.details.input ?? 'declaration').sort(), ['declaration', 'map']);
                return true;
            },
        );
    });

    it('compiles explicit v2 into a deeply frozen, non-forgeable result', async () => {
        const declaration = {
            version: 2,
            requires: [],
            entity: {
                user: {
                    attr: {
                        id: {
                            type: {id: 'core.integer', params: {bits: 32, unsigned: false}},
                            generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
                        },
                        name: {type: {id: 'core.string', params: {length: 64}}, nullable: false},
                    },
                    index: {pk: primary()},
                    relation: {},
                },
            },
            package: {},
            refs: {},
        };
        const result = await compiler.exec({
            adapter: createFakeAdapter(),
            fragments: [fragment('app', declaration)],
            mapEnvelope: mapEnvelope(),
        });

        assert.equal(compiler.assertResult({value: result}), result);
        assert.throws(() => compiler.assertResult({value: structuredClone(result)}), /successful DEM compilation result/);
        assert.equal(Object.isFrozen(result), true);
        assert.equal(Object.isFrozen(result.model.entity.user.attr.id.type.params), true);
        assert.equal(Object.isFrozen(result.physical.phases), true);
        assert.equal(Object.isFrozen(result.provenance['/entity/user']), true);
        assert.match(result.fingerprint, /^sha256-v1:[0-9a-f]{64}$/);
    });

    it('produces identical outputs for every permutation of disjoint fragments', async () => {
        const first = fragment('a', {
            version: 2,
            requires: [],
            entity: {alpha: {attr: {id: {type: {id: 'core.integer', params: {}}}}, index: {pk: primary()}, relation: {}}},
            package: {}, refs: {},
        });
        const second = fragment('b', {
            version: 2,
            requires: [],
            entity: {beta: {attr: {id: {type: {id: 'core.integer', params: {}}}}, index: {pk: primary()}, relation: {}}},
            package: {}, refs: {},
        });
        const third = fragment('c', {
            version: 2,
            requires: [],
            entity: {gamma: {attr: {id: {type: {id: 'core.integer', params: {}}}}, index: {pk: primary()}, relation: {}}},
            package: {}, refs: {},
        });
        const permutations = [
            [first, second, third], [first, third, second], [second, first, third],
            [second, third, first], [third, first, second], [third, second, first],
        ];
        const results = [];
        for (const fragments of permutations) {
            results.push(await compiler.exec({adapter: createFakeAdapter(), fragments, mapEnvelope: mapEnvelope()}));
        }
        for (const result of results.slice(1)) {
            assert.deepEqual(result.model, results[0].model);
            assert.deepEqual(result.provenance, results[0].provenance);
            assert.deepEqual(result.graph, results[0].graph);
            assert.deepEqual(result.physical, results[0].physical);
            assert.equal(result.fingerprint, results[0].fingerprint);
        }
    });

    it('expands a concise fragment root and resolves local relations against it', async () => {
        const declaration = {
            version: 2,
            namespace: 'teqfw.db.schema',
            requires: [],
            refs: {},
            entity: {
                parent: {
                    attr: {id: {type: {id: 'core.integer', params: {}}}},
                    index: {pk: primary()},
                    relation: {},
                },
                child: {
                    attr: {
                        id: {type: {id: 'core.integer', params: {}}},
                        parent_id: {type: {id: 'core.integer', params: {}}},
                    },
                    index: {pk: primary()},
                    relation: {
                        parent: {
                            action: {},
                            attrs: ['parent_id'],
                            deferrable: 'notDeferrable',
                            ref: {attrs: ['id'], path: '/parent'},
                        },
                    },
                },
            },
            package: {},
        };
        const result = await compiler.exec({
            adapter: createFakeAdapter(),
            fragments: [fragment('rooted', declaration)],
            mapEnvelope: mapEnvelope({version: 2}),
        });

        assert.equal(result.model.package.teqfw.package.db.package.schema.entity.child.path, '/teqfw/db/schema/child');
        assert.equal(result.model.package.teqfw.package.db.package.schema.entity.child.relation.parent.ref.path, '/teqfw/db/schema/parent');
        assert.deepEqual(result.graph.entities, ['/teqfw/db/schema/child', '/teqfw/db/schema/parent']);
        assert.equal(
            result.physical.tables.find((item) => item.entity === '/teqfw/db/schema/child').name,
            'teqfw_db_schema_child',
        );
        assert.equal(result.provenance['/package/teqfw/package/db/package/schema/entity/child'][0].sourcePointer, '/entity/child');
    });

    it('rejects invalid fragment root namespace identifiers', async () => {
        await assert.rejects(
            compiler.exec({
                adapter: createFakeAdapter(),
                fragments: [fragment('invalid-root', {
                    version: 2,
                    namespace: 'teqfw.db_schema',
                    requires: [],
                    refs: {},
                    entity: {},
                    package: {},
                })],
                mapEnvelope: mapEnvelope({version: 2}),
            }),
            (error) => {
                assert.ok(error.diagnostics.some((item) => item.code === 'DEM_DECLARATION_IDENTIFIER_INVALID' && item.path === '/namespace'));
                return true;
            },
        );
    });

    it('aggregates ownership and independent logical failures with no conflict winner', async () => {
        const conflictA = fragment('a', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {shared: {attr: {id: {type: {id: 'core.integer', params: {}}}}, index: {pk: primary()}, relation: {}}},
        });
        const conflictB = fragment('b', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {shared: {attr: {id: {type: {id: 'core.integer', params: {}}}}, index: {pk: primary()}, relation: {}}},
        });
        const invalid = fragment('c', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {invalid: {attr: {value: {type: {id: 'vendor.unknown', params: {}}}}, index: {}, relation: {}}},
        });

        await assert.rejects(
            compiler.exec({adapter: createFakeAdapter(), fragments: [invalid, conflictB, conflictA], mapEnvelope: mapEnvelope()}),
            (error) => {
                assert.equal(error.name, 'DemCompilationError');
                assert.equal('model' in error, false);
                assert.equal('physical' in error, false);
                const codes = error.diagnostics.map((item) => item.code);
                assert.ok(codes.includes('DEM_COMPOSITION_OWNER_CONFLICT'));
                assert.ok(codes.includes('DEM_TYPE_UNKNOWN'));
                const entityConflict = error.diagnostics.find((item) => item.path === '/entity/shared');
                assert.deepEqual(entityConflict.sources.map((item) => item.fragmentId), ['a', 'b']);
                return true;
            },
        );
    });

    it('resolves external references by relation owner and retains map provenance', async () => {
        const identity = fragment('identity', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {user: {attr: {id: {type: {id: 'core.integer', params: {}}}}, index: {pk: primary()}, relation: {}}},
        });
        const content = fragment('content', {
            version: 2,
            requires: [],
            entity: {
                post: {
                    attr: {owner_id: {type: {id: 'core.integer', params: {}}}},
                    index: {},
                    relation: {
                        owner: {
                            attrs: ['owner_id'],
                            ref: {path: '/external/user', attrs: ['external_id']},
                            action: {delete: 'restrict', update: 'cascade'},
                            deferrable: 'notDeferrable',
                        },
                    },
                },
            },
            package: {},
            refs: {'/external/user': ['external_id']},
        });
        const map = mapEnvelope({
            version: 2,
            namespace: 'teq',
            ref: {content: {'/external/user': {path: '/user', attrs: {external_id: 'id'}}}},
            deprecated: {},
        });
        const result = await compiler.exec({adapter: createFakeAdapter(), fragments: [content, identity], mapEnvelope: map});
        const relation = result.model.entity.post.relation.owner;

        assert.equal(relation.ref.path, '/user');
        assert.deepEqual(relation.ref.attrs, ['id']);
        assert.deepEqual(
            result.provenance['/entity/post/relation/owner'].map((item) => item.fragmentId),
            ['app-map', 'content'],
        );
    });

    it('returns deterministic SCC cycles while preserving separated schema phases', async () => {
        const declaration = {
            version: 2, requires: [], package: {}, refs: {},
            entity: {
                alpha: {
                    attr: {id: {type: {id: 'core.integer', params: {}}}, beta_id: {type: {id: 'core.integer', params: {}}}},
                    index: {pk: primary()},
                    relation: {beta: {attrs: ['beta_id'], ref: {path: '/beta', attrs: ['id']}, action: {}, deferrable: 'deferred'}},
                },
                beta: {
                    attr: {id: {type: {id: 'core.integer', params: {}}}, alpha_id: {type: {id: 'core.integer', params: {}}}},
                    index: {pk: primary()},
                    relation: {alpha: {attrs: ['alpha_id'], ref: {path: '/alpha', attrs: ['id']}, action: {}, deferrable: 'deferred'}},
                },
            },
        };
        const result = await compiler.exec({adapter: createFakeAdapter(), fragments: [fragment('app', declaration)], mapEnvelope: mapEnvelope()});

        assert.deepEqual(result.graph.cycles.map((item) => item.entities), [['/alpha', '/beta']]);
        assert.deepEqual(Object.keys(result.physical.phases), [
            'preflight', 'tables', 'relations', 'afterRelations', 'data', 'afterData', 'verification',
        ]);
    });

    it('rejects unsupported versions and closed-shape violations with structured diagnostics', async () => {
        await assert.rejects(
            compiler.exec({
                adapter: createFakeAdapter(),
                fragments: [fragment('app', {version: 3, entity: {}, package: {}, refs: {}, requires: [], typo: true})],
                mapEnvelope: mapEnvelope(),
            }),
            (error) => {
                assert.deepEqual([...new Set(error.diagnostics.map((item) => item.code))], [
                    'DEM_DECLARATION_SHAPE_INVALID',
                    'DEM_DECLARATION_VERSION_UNSUPPORTED',
                ]);
                assert.equal(error.diagnostics[0].path, '/typo');
                assert.equal(error.diagnostics[1].path, '/version');
                return true;
            },
        );
    });

    it('resolves core.identity and core.ref into portable primary and foreign keys for SQLite and PostgreSQL', async () => {
        const identity = fragment('identity', {
            version: 2, requires: [], package: {}, refs: {},
            entity: {user: {attr: {id: {type: {id: 'core.identity'}}}, index: {}, relation: {}}},
        });
        const content = fragment('content', {
            version: 2, requires: [], package: {}, refs: {'/identity/user': ['id']},
            entity: {
                post: {
                    attr: {id: {type: {id: 'core.identity'}}, owner_id: {type: {id: 'core.ref'}}},
                    index: {},
                    relation: {
                        owner: {
                            action: {delete: 'restrict', update: 'cascade'},
                            attrs: ['owner_id'], deferrable: 'notDeferrable',
                            ref: {attrs: ['id'], path: '/identity/user'},
                        },
                    },
                },
            },
        });
        const map = mapEnvelope({
            version: 2,
            namespace: 'teq',
            identityProfile: {
                generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
                type: {id: 'core.integer', params: {bits: 64, unsigned: false}},
            },
            ref: {content: {'/identity/user': {attrs: {}, path: '/user'}}},
        });

        for (const [dialect, adapter] of Object.entries(dialectAdapters)) {
            const result = await compiler.exec({adapter, fragments: [content, identity], mapEnvelope: map});
            const userId = result.model.entity.user.attr.id;
            const post = result.model.entity.post;
            assert.deepEqual(userId.type, {id: 'core.integer', params: {bits: 64, unsigned: false}});
            assert.deepEqual(userId.generation, {kind: 'core.identity', params: {mode: 'byDefault'}});
            assert.deepEqual(post.attr.owner_id.type, userId.type);
            assert.equal(JSON.stringify(result.model).includes('"role"'), false);
            assert.equal(Object.values(post.index).filter((index) => index.kind === 'primary').length, 1);
            assert.equal(result.provenance['/entity/user/attr/id/generation'][0].fragmentId, 'app-map');
            const userColumn = result.physical.tables.find((table) => table.entity === '/user').columns.find((column) => column.name === 'id');
            assert.equal(userColumn.physicalType.dialect, dialect);
            assert.equal(userColumn.physicalType.type, 'bigint');
        }
    });

    it('rejects obsolete role declarations, invalid profiles, and ambiguous core.ref derivations deterministically', async () => {
        const declaration = {
            version: 2, requires: [], package: {}, refs: {},
            entity: {
                user: {attr: {id: {role: 'identity', type: {id: 'core.integer', params: {}}}}, index: {}, relation: {}},
                post: {
                    attr: {owner_id: {type: {id: 'core.ref'}}}, index: {},
                    relation: {
                        first: {action: {}, attrs: ['owner_id'], deferrable: 'notDeferrable', ref: {attrs: ['id'], path: '/user'}},
                        second: {action: {}, attrs: ['owner_id'], deferrable: 'notDeferrable', ref: {attrs: ['id'], path: '/user'}},
                    },
                },
            },
        };
        await assert.rejects(
            compiler.exec({
                adapter: createFakeAdapter(), fragments: [fragment('app', declaration)],
                mapEnvelope: mapEnvelope({version: 2, namespace: 'teq', identityProfile: {type: {id: 'core.integer', params: {}}}}),
            }),
            (error) => {
                const diagnostics = new Map(error.diagnostics.map((item) => [`${item.code}:${item.path}`, item]));
                assert.ok(diagnostics.has('DEM_DECLARATION_SHAPE_INVALID:/entity/user/attr/id/role'));
                assert.ok(diagnostics.has('DEM_DECLARATION_SHAPE_INVALID:/identityProfile'));
                assert.ok(diagnostics.has('DEM_RELATION_CARDINALITY:/entity/post/attr/owner_id'));
                return true;
            },
        );
    });
});
