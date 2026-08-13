import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');

function attr(id = 'core.integer', params = {}) {
    return {type: {id, params}};
}

function key(kind, attrs, extra = {}) {
    return {
        kind,
        keys: attrs.map((name) => ({attr: name})),
        include: [],
        options: {},
        phase: 'table',
        ...extra,
    };
}

function baseDeclaration() {
    return {
        version: 2,
        requires: [],
        entity: {
            child: {
                attr: {id: attr(), parent_id: attr()},
                index: {pk: key('primary', ['id'])},
                relation: {
                    parent: {
                        attrs: ['parent_id'],
                        ref: {path: '/parent', attrs: ['id']},
                        action: {delete: 'restrict', update: 'cascade'},
                        deferrable: 'notDeferrable',
                    },
                },
            },
            parent: {
                attr: {id: attr(), code: attr('core.string', {length: 32})},
                index: {pk: key('primary', ['id']), uq_code: key('unique', ['code'])},
                relation: {},
            },
        },
        package: {},
        refs: {},
    };
}

function fragment(fragmentId, declaration) {
    return {
        declaration,
        filename: `/fixtures/${fragmentId}/etc/teqfw.schema.json`,
        fragmentId,
        packageName: fragmentId,
    };
}

function mapEnvelope() {
    return {
        declaration: {version: 2, namespace: 'teq'},
        filename: '/fixtures/app/etc/teqfw.schema.map.json',
        mapId: 'app-map',
        packageName: 'app',
    };
}

async function getDiagnostics(declaration, adapter = createFakeAdapter()) {
    try {
        await compiler.exec({adapter, fragments: [fragment('app', declaration)], mapEnvelope: mapEnvelope()});
    } catch (error) {
        assert.equal(error.name, 'DemCompilationError');
        return error.diagnostics;
    }
    assert.fail('Compilation was expected to fail.');
}

describe('TeqFw_Db_Back_Dem_Compile_A_Validate', () => {
    it('accepts the nearest complete relation/type/index fixture', async () => {
        const result = await compiler.exec({
            adapter: createFakeAdapter(),
            fragments: [fragment('app', baseDeclaration())],
            mapEnvelope: mapEnvelope(),
        });
        assert.equal(result.graph.edges.length, 1);
        assert.deepEqual(result.graph.topological, ['/parent', '/child']);
    });

    it('aggregates unknown and invalid type parameters', async () => {
        const declaration = baseDeclaration();
        declaration.entity.parent.attr.unknown = attr('vendor.unknown');
        declaration.entity.parent.attr.decimal = attr('core.decimal', {precision: 2, scale: 3, typo: true});
        declaration.entity.parent.attr.vector = attr('core.vector', {dimensions: 0, element: 'bit', sparse: true});
        const diagnostics = await getDiagnostics(declaration);

        assert.deepEqual(diagnostics.map((item) => item.code), [
            'DEM_TYPE_PARAMS_INVALID',
            'DEM_TYPE_UNKNOWN',
            'DEM_TYPE_PARAMS_INVALID',
        ]);
        assert.deepEqual(diagnostics.map((item) => item.path), [
            '/entity/parent/attr/decimal',
            '/entity/parent/attr/unknown',
            '/entity/parent/attr/vector',
        ]);
    });

    it('rejects incompatible literals, functions, combinations, and generation kinds', async () => {
        const declaration = baseDeclaration();
        declaration.entity.parent.attr.too_long = {
            ...attr('core.string', {length: 3}),
            default: {kind: 'literal', value: 'long'},
        };
        declaration.entity.parent.attr.wrong_function = {
            ...attr('core.datetime', {}),
            default: {kind: 'function', name: 'core.currentDate', params: {}},
        };
        declaration.entity.parent.attr.both = {
            ...attr(),
            default: {kind: 'literal', value: 1},
            generation: {kind: 'core.identity', params: {mode: 'always'}},
        };
        declaration.entity.parent.attr.wrong_generation = {
            ...attr('core.string', {length: 10}),
            generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
        };
        const diagnostics = await getDiagnostics(declaration);
        const byPath = Object.fromEntries(diagnostics.map((item) => [item.path, item.code]));

        assert.equal(byPath['/entity/parent/attr/too_long/default'], 'DEM_DEFAULT_INVALID');
        assert.equal(byPath['/entity/parent/attr/wrong_function/default'], 'DEM_DEFAULT_INVALID');
        assert.equal(byPath['/entity/parent/attr/both/default'], 'DEM_DEFAULT_INVALID');
        assert.equal(byPath['/entity/parent/attr/wrong_generation/generation'], 'DEM_GENERATION_INVALID');
    });

    it('reports index attributes, duplicates, primary count, expressions, and phase invariants', async () => {
        const declaration = baseDeclaration();
        const indexes = declaration.entity.parent.index;
        indexes.missing = key('index', ['absent'], {method: 'provider.method'});
        indexes.duplicate = key('index', ['code', 'code'], {method: 'provider.method'});
        indexes.pk_second = key('primary', ['code']);
        indexes.expression = {
            kind: 'index', method: 'provider.method', include: [], options: {}, phase: 'afterRelations',
            keys: [{expression: {kind: 'call', operator: 'provider.unknown', args: [{kind: 'attr', name: 'code'}]}}],
        };
        indexes.bad_phase = key('index', ['code'], {method: 'provider.method', phase: 'later'});
        const diagnostics = await getDiagnostics(declaration);
        const codes = diagnostics.map((item) => item.code);

        assert.ok(codes.includes('DEM_REFERENCE_ATTRIBUTE_MISSING'));
        assert.ok(codes.includes('DEM_EXPRESSION_INVALID'));
        assert.ok(codes.filter((code) => code === 'DEM_INDEX_INVALID').length >= 5);
        assert.ok(diagnostics.some((item) => item.path === '/entity/parent/index' && item.details.primaryCount === 2));
    });

    it('does not accept ordinary or partial unique indexes as relation target keys', async () => {
        const ordinary = baseDeclaration();
        ordinary.entity.parent.index.uq_code = key('index', ['code'], {method: 'provider.method'});
        ordinary.entity.child.relation.parent.attrs = ['parent_id'];
        ordinary.entity.child.relation.parent.ref.attrs = ['code'];
        ordinary.entity.child.attr.parent_id = attr('core.string', {length: 32});
        const ordinaryDiagnostics = await getDiagnostics(ordinary);
        assert.ok(ordinaryDiagnostics.some((item) => item.code === 'DEM_RELATION_TARGET_NOT_UNIQUE'));

        const partial = baseDeclaration();
        partial.entity.parent.index.uq_code.predicate = {
            kind: 'call', operator: 'core.notNull', args: [{kind: 'attr', name: 'code'}],
        };
        partial.entity.child.relation.parent.ref.attrs = ['code'];
        partial.entity.child.attr.parent_id = attr('core.string', {length: 32});
        const partialDiagnostics = await getDiagnostics(partial);
        assert.ok(partialDiagnostics.some((item) => item.code === 'DEM_INDEX_INVALID'));
        assert.ok(partialDiagnostics.some((item) => item.code === 'DEM_RELATION_TARGET_NOT_UNIQUE'));
    });

    it('separates relation cardinality, endpoint, compatibility, and uniqueness diagnostics', async () => {
        const empty = baseDeclaration();
        empty.entity.child.relation.parent.attrs = [];
        empty.entity.child.relation.parent.ref.attrs = [];
        const emptyDiagnostics = await getDiagnostics(empty);
        assert.deepEqual(emptyDiagnostics.map((item) => item.code), ['DEM_RELATION_CARDINALITY']);

        const missingEntity = baseDeclaration();
        missingEntity.entity.child.relation.parent.ref.path = '/absent';
        const missingEntityDiagnostics = await getDiagnostics(missingEntity);
        assert.ok(missingEntityDiagnostics.some((item) => item.code === 'DEM_REFERENCE_ENTITY_MISSING'));

        const missingAttr = baseDeclaration();
        missingAttr.entity.child.relation.parent.attrs = ['absent'];
        const missingAttrDiagnostics = await getDiagnostics(missingAttr);
        assert.ok(missingAttrDiagnostics.some((item) => item.code === 'DEM_REFERENCE_ATTRIBUTE_MISSING'));

        const mismatch = baseDeclaration();
        mismatch.entity.child.attr.parent_id = attr('core.string', {length: 32});
        const mismatchDiagnostics = await getDiagnostics(mismatch);
        assert.ok(mismatchDiagnostics.some((item) => item.code === 'DEM_RELATION_TYPE_MISMATCH'));

        const notUnique = baseDeclaration();
        notUnique.entity.child.relation.parent.ref.attrs = ['code'];
        notUnique.entity.child.attr.parent_id = attr('core.string', {length: 32});
        delete notUnique.entity.parent.index.uq_code;
        const notUniqueDiagnostics = await getDiagnostics(notUnique);
        assert.ok(notUniqueDiagnostics.some((item) => item.code === 'DEM_RELATION_TARGET_NOT_UNIQUE'));
    });

    it('detects physical-name collisions after namespace conversion', async () => {
        const declaration = {
            version: 2, requires: [], entity: {}, refs: {},
            package: {
                a: {
                    entity: {b_c: {attr: {id: attr()}, index: {pk: key('primary', ['id'])}, relation: {}}},
                    package: {},
                },
                a_b: {
                    entity: {c: {attr: {id: attr()}, index: {pk: key('primary', ['id'])}, relation: {}}},
                    package: {},
                },
            },
        };
        const diagnostics = await getDiagnostics(declaration);
        assert.equal(diagnostics[0].code, 'DEM_PHYSICAL_NAME_COLLISION');
        assert.deepEqual(diagnostics[0].details.entities, ['/a/b_c', '/a_b/c']);
    });

    it('deduplicates capability union with all provenance and rejects unsupported adapters', async () => {
        const one = baseDeclaration();
        one.requires = ['provider.feature'];
        const two = {version: 2, requires: ['provider.feature'], entity: {}, package: {}, refs: {}};
        const supported = await compiler.exec({
            adapter: createFakeAdapter({supportedCapabilities: ['provider.feature']}),
            fragments: [fragment('one', one), fragment('two', two)],
            mapEnvelope: mapEnvelope(),
        });
        assert.deepEqual(supported.requirements, ['provider.feature']);
        assert.deepEqual(
            supported.provenance['/requires/provider.feature'].map((item) => item.fragmentId),
            ['one', 'two'],
        );

        const diagnostics = await getDiagnostics(one, createFakeAdapter());
        assert.equal(diagnostics[0].code, 'DEM_CAPABILITY_UNSUPPORTED');
        assert.equal(diagnostics[0].details.capability, 'provider.feature');
    });

    it('enforces adapter-reported physical relation compatibility', async () => {
        const base = createFakeAdapter();
        const adapter = Object.freeze({
            ...base,
            resolveType: async function (input) {
                const value = await base.resolveType(input);
                return {
                    ...value,
                    compatibilitySignature: input.location.includes('/entity/child/') ? 'child-physical' : 'parent-physical',
                };
            },
        });
        const diagnostics = await getDiagnostics(baseDeclaration(), adapter);
        assert.ok(diagnostics.some((item) => item.code === 'DEM_RELATION_TYPE_MISMATCH'
            && item.stage === 'dialect' && item.details.scope === 'physical'));
    });

    it('keeps aggregate diagnostic order identical across fragment permutations', async () => {
        const first = {
            version: 2, requires: [], package: {}, refs: {},
            entity: {zeta: {attr: {bad: attr('bad.type')}, index: {}, relation: {}}},
        };
        const second = {
            version: 2, requires: [], package: {}, refs: {},
            entity: {alpha: {attr: {bad: attr('also.bad')}, index: {}, relation: {}}},
        };
        const run = async function (fragments) {
            try {
                await compiler.exec({adapter: createFakeAdapter(), fragments, mapEnvelope: mapEnvelope()});
            } catch (error) {
                return error.diagnostics;
            }
            assert.fail('Compilation was expected to fail.');
        };
        const left = await run([fragment('z', first), fragment('a', second)]);
        const right = await run([fragment('a', second), fragment('z', first)]);
        assert.deepEqual(left, right);
        assert.deepEqual(left.map((item) => item.path), ['/entity/alpha/attr/bad', '/entity/zeta/attr/bad']);
    });
});
