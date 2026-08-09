import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile_A_DecodeV1} */
const decodeV1 = await container.get('TeqFw_Db_Back_Dem_Compile_A_DecodeV1$');
/** @type {TeqFw_Db_Back_Dem_Compile_A_DecodeV2} */
const decodeV2 = await container.get('TeqFw_Db_Back_Dem_Compile_A_DecodeV2$');

function envelope(declaration, fragmentId = 'fixture') {
    return {
        declaration,
        filename: `/fixtures/${fragmentId}/etc/teqfw.schema.json`,
        fragmentId,
        packageName: fragmentId,
    };
}

describe('DEM version decoders', () => {
    it('decodes the complete v1 type and option regression surface', () => {
        const input = {
            entity: {
                sample: {
                    comment: 'Legacy entity',
                    attr: {
                        binary: {type: 'binary', options: {length: 12}},
                        boolean: {type: 'boolean'},
                        date: {type: 'datetime', options: {dateOnly: true}, default: '2026-08-09'},
                        datetime: {type: 'datetime', default: 'current'},
                        decimal: {type: 'number', options: {precision: 10, scale: 3, unsigned: true}},
                        enumeration: {type: 'enum', options: {values: ['a', 'b']}},
                        id: {type: 'id'},
                        integer: {type: 'integer', options: {isTiny: true, unsigned: true}},
                        json: {type: 'json'},
                        ref: {type: 'ref'},
                        string: {type: 'string', options: {length: 42}, nullable: true},
                        text: {type: 'text'},
                    },
                    index: {
                        idx: {type: 'index', attrs: ['string']},
                        pk: {type: 'primary', attrs: ['id']},
                        uq: {type: 'unique', attrs: ['string', 'integer']},
                    },
                    relation: {
                        owner: {
                            attrs: ['ref'],
                            ref: {path: '/owner', attrs: ['id']},
                            action: {delete: 'RESTRICT', update: 'CASCADE'},
                        },
                    },
                },
            },
            refs: {'/owner': ['id']},
        };
        const before = structuredClone(input);
        const decoded = decodeV1.exec({envelope: envelope(input)});
        const attrs = decoded.declaration.entity.sample.attr;

        assert.deepEqual(input, before);
        assert.deepEqual(attrs.binary.type, {id: 'core.binary', params: {length: 12}});
        assert.deepEqual(attrs.boolean.type, {id: 'core.boolean', params: {}});
        assert.deepEqual(attrs.date.type, {id: 'core.date', params: {}});
        assert.deepEqual(attrs.date.default, {kind: 'literal', value: '2026-08-09'});
        assert.deepEqual(attrs.datetime.default, {kind: 'function', name: 'core.currentTimestamp', params: {}});
        assert.deepEqual(attrs.decimal.type, {id: 'core.decimal', params: {precision: 10, scale: 3, unsigned: true}});
        assert.deepEqual(attrs.enumeration.type, {id: 'core.enum', params: {values: ['a', 'b']}});
        assert.equal(attrs.id.compatibility.physical, 'increments');
        assert.equal(attrs.integer.type.params.bits, 8);
        assert.equal(attrs.integer.type.params.unsigned, true);
        assert.equal(attrs.json.compatibility.physical, 'jsonb');
        assert.deepEqual(attrs.id.type, attrs.ref.type);
        assert.equal(attrs.string.type.params.length, 42);
        assert.equal(attrs.string.nullable, true);
        assert.deepEqual(attrs.text.type, {id: 'core.text', params: {}});
        assert.equal(decoded.declaration.entity.sample.index.idx.method, 'legacy.defaultIndex');
        assert.equal(decoded.declaration.entity.sample.index.idx.phase, 'table');
        assert.deepEqual(decoded.declaration.entity.sample.index.uq.keys, [{attr: 'string'}, {attr: 'integer'}]);
        assert.deepEqual(decoded.declaration.entity.sample.relation.owner.action, {delete: 'restrict', update: 'cascade'});
        assert.equal(decoded.declaration.entity.sample.relation.owner.deferrable, 'notDeferrable');
        assert.deepEqual(decoded.declaration.refs, {'/owner': ['id']});
        assert.equal(decoded.diagnostics.length, 0);
    });

    it('retains partial and ambiguous number physical hints with explicit warnings', () => {
        const decoded = decodeV1.exec({envelope: envelope({
            entity: {
                metric: {
                    attr: {
                        neither: {type: 'number'},
                        precision: {type: 'number', options: {precision: 9}},
                        scale: {type: 'number', options: {scale: 4}},
                    },
                },
            },
        })});

        assert.equal(decoded.declaration.entity.metric.attr.neither.compatibility.physical, 'integer');
        assert.deepEqual(decoded.declaration.entity.metric.attr.precision.compatibility, {
            source: 'v1', physical: 'decimal', precision: 9, scale: null, legacyType: 'number',
        });
        assert.deepEqual(decoded.declaration.entity.metric.attr.scale.compatibility, {
            source: 'v1', physical: 'decimal', precision: null, scale: 4, legacyType: 'number',
        });
        assert.deepEqual(decoded.diagnostics.map((item) => item.code), [
            'DEM_V1_AMBIGUOUS_NUMBER',
            'DEM_V1_PARTIAL_DECIMAL',
            'DEM_V1_PARTIAL_DECIMAL',
        ]);
        assert.ok(decoded.diagnostics.every((item) => item.severity === 'warning'));
    });

    it('inserts v2 canonical defaults while retaining full index and expression shapes', () => {
        const decoded = decodeV2.exec({envelope: envelope({
            version: 2,
            requires: ['provider.capability'],
            entity: {
                account: {
                    attr: {email: {type: {id: 'core.string', params: {length: 128}}}},
                    index: {
                        lower_email: {
                            kind: 'index',
                            method: 'provider.method',
                            keys: [{expression: {kind: 'call', operator: 'core.lower', args: [{kind: 'attr', name: 'email'}]}}],
                            include: [],
                            predicate: {kind: 'call', operator: 'core.notNull', args: [{kind: 'attr', name: 'email'}]},
                            options: {fill: 80},
                            phase: 'afterRelations',
                        },
                    },
                    relation: {},
                },
            },
            package: {},
            refs: {},
        })});
        const entity = decoded.declaration.entity.account;

        assert.equal(entity.path, '/account');
        assert.equal(entity.attr.email.nullable, false);
        assert.deepEqual(entity.attr.email.storage, {});
        assert.equal(entity.index.lower_email.keys[0].expression.operator, 'core.lower');
        assert.equal(entity.index.lower_email.predicate.operator, 'core.notNull');
        assert.deepEqual(decoded.declaration.requires, ['provider.capability']);
        assert.equal(decoded.diagnostics.length, 0);
    });

    it('rejects unknown v2 fields and compatibility-only index markers', () => {
        const decoded = decodeV2.exec({envelope: envelope({
            version: 2,
            requires: [],
            entity: {
                sample: {
                    attr: {id: {type: {id: 'core.integer', params: {}}, typo: true}},
                    index: {
                        idx: {
                            kind: 'index', method: 'legacy.defaultIndex', keys: [{attr: 'id'}],
                            include: [], options: {}, phase: 'table',
                        },
                    },
                    relation: {},
                },
            },
            package: {}, refs: {},
        })});

        assert.deepEqual(decoded.diagnostics.map((item) => item.code), [
            'DEM_DECLARATION_SHAPE_INVALID',
            'DEM_INDEX_INVALID',
        ]);
        assert.deepEqual(decoded.diagnostics.map((item) => item.path), [
            '/entity/sample/attr/id/typo',
            '/entity/sample/index/idx/method',
        ]);
    });
});
