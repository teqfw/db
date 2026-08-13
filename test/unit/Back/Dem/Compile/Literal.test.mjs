import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');

function attribute(id, params, value, nullable = false) {
    return {type: {id, params}, nullable, default: {kind: 'literal', value}};
}

function input(attributes) {
    return {
        adapter: createFakeAdapter(),
        fragments: [{
            declaration: {
                version: 2, requires: [], package: {}, refs: {},
                entity: {sample: {attr: attributes, index: {}, relation: {}}},
            },
            filename: '/fixtures/literal/etc/teqfw.schema.json',
            fragmentId: 'literal',
            packageName: 'literal',
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'teq'},
            filename: '/fixtures/literal/etc/teqfw.schema.map.json',
            mapId: 'literal-map',
            packageName: 'literal',
        },
    };
}

describe('DEM core literal validation', () => {
    it('accepts the nearest valid value for every core logical family', async () => {
        const values = {
            binary: attribute('core.binary', {length: 4}, '0101'),
            boolean: attribute('core.boolean', {}, false),
            date: attribute('core.date', {}, '2024-02-29'),
            datetime: attribute('core.datetime', {timezone: true, precision: 3}, '2026-08-09T12:34:56.123Z'),
            decimal: attribute('core.decimal', {precision: 5, scale: 2, unsigned: true}, '123.45'),
            enumeration: attribute('core.enum', {values: ['one', 'two']}, 'one'),
            integer: attribute('core.integer', {bits: 8, unsigned: false}, 127),
            json: attribute('core.json', {}, {enabled: true}),
            nullable: attribute('core.text', {}, null, true),
            string: attribute('core.string', {length: 3}, ''),
            text: attribute('core.text', {}, 'text'),
            uuid: attribute('core.uuid', {}, '123e4567-e89b-12d3-a456-426614174000'),
            vector: attribute('core.vector', {dimensions: 3, element: 'float', sparse: false}, [0, 1, 2]),
            bit: attribute('core.vector', {dimensions: 3, element: 'bit', sparse: false}, '010'),
            sparse: attribute('core.vector', {dimensions: 4, element: 'float', sparse: true}, {
                dimensions: 4,
                entries: [{index: 1, value: 2}, {index: 4, value: -1}],
            }),
        };
        const result = await compiler.exec(input(values));
        assert.equal(result.model.entity.sample.attr.string.default.value, '');
        assert.equal(result.model.entity.sample.attr.boolean.default.value, false);
        assert.equal(result.model.entity.sample.attr.integer.default.value, 127);
    });

    it('rejects invalid calendar, range, precision, nullable, and vector values independently', async () => {
        const values = {
            date: attribute('core.date', {}, '2024-02-30'),
            decimal_precision: attribute('core.decimal', {precision: 5, scale: 2, unsigned: false}, '1234.56'),
            decimal_scale: attribute('core.decimal', {precision: 5, scale: 2, unsigned: false}, '1.234'),
            integer_signed: attribute('core.integer', {bits: 8, unsigned: false}, 128),
            integer_unsigned: attribute('core.integer', {bits: 8, unsigned: true}, -1),
            non_nullable: attribute('core.text', {}, null),
            vector_dimension: attribute('core.vector', {dimensions: 3, element: 'float', sparse: false}, [1, 2]),
            vector_non_finite: attribute('core.vector', {dimensions: 2, element: 'float', sparse: false}, [1, Infinity]),
            bit: attribute('core.vector', {dimensions: 3, element: 'bit', sparse: false}, '012'),
            sparse_order: attribute('core.vector', {dimensions: 4, element: 'float', sparse: true}, {
                dimensions: 4, entries: [{index: 2, value: 1}, {index: 1, value: 1}],
            }),
            sparse_zero: attribute('core.vector', {dimensions: 4, element: 'float', sparse: true}, {
                dimensions: 4, entries: [{index: 1, value: 0}],
            }),
        };
        await assert.rejects(compiler.exec(input(values)), (error) => {
            assert.equal(error.name, 'DemCompilationError');
            assert.equal(error.diagnostics.length, Object.keys(values).length);
            assert.ok(error.diagnostics.every((item) => item.code === 'DEM_DEFAULT_INVALID'));
            return true;
        });
    });
});
