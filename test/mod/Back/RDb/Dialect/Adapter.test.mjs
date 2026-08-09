import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
const adapters = Object.freeze({
    mysql: await container.get('TeqFw_Db_Back_RDb_Dialect_Mysql$'),
    postgresql: await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$'),
    sqlite: await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$'),
});

const declaration = Object.freeze({
    entity: {
        parent: {
            attr: {
                binary_value: {type: 'binary', options: {length: 16}},
                boolean_value: {type: 'boolean', default: false},
                date_value: {type: 'datetime', options: {dateOnly: true}, default: '2024-02-29'},
                datetime_value: {type: 'datetime', default: 'current'},
                decimal_value: {type: 'number', options: {precision: 10, scale: 3, unsigned: true}},
                enum_value: {type: 'enum', options: {values: ['first', 'second']}},
                id: {type: 'id'},
                integer_value: {type: 'integer', options: {isTiny: true, unsigned: true}},
                json_value: {type: 'json'},
                number_value: {type: 'number', options: {unsigned: true}},
                partial_value: {type: 'number', options: {precision: 9}},
                string_value: {type: 'string', options: {length: 42}},
                text_value: {type: 'text', nullable: true, comment: 'Text value.'},
            },
            index: {
                ordinary: {type: 'index', attrs: ['string_value']},
                pk: {type: 'primary', attrs: ['id']},
                uq: {type: 'unique', attrs: ['string_value']},
            },
        },
        child: {
            attr: {
                id: {type: 'id'},
                parent_ref: {type: 'ref'},
            },
            index: {pk: {type: 'primary', attrs: ['id']}},
            relation: {
                parent: {
                    action: {delete: 'CASCADE', update: 'RESTRICT'},
                    attrs: ['parent_ref'],
                    ref: {attrs: ['id'], path: '/parent'},
                },
            },
        },
    },
});

function fragment() {
    return {
        declaration: structuredClone(declaration),
        filename: '/fixtures/app/etc/teqfw.schema.json',
        fragmentId: 'app',
        packageName: 'app',
    };
}

function mapEnvelope() {
    return {
        declaration: {namespace: 'teq'},
        filename: '/fixtures/app/etc/teqfw.schema.map.json',
        mapId: 'app:map',
        packageName: 'app',
    };
}

describe('Knex dialect adapter v1 projection', () => {
    for (const [dialect, adapter] of Object.entries(adapters)) {
        it(`preserves the complete legacy descriptor matrix for ${dialect}`, async () => {
            const result = await compile.exec({adapter, fragments: [fragment()], mapEnvelope: mapEnvelope()});
            const parent = result.physical.tables.find((item) => item.entity === '/parent');
            const child = result.physical.tables.find((item) => item.entity === '/child');
            const columns = Object.fromEntries(parent.columns.map((item) => [item.name, item]));
            const childColumns = Object.fromEntries(child.columns.map((item) => [item.name, item]));

            assert.equal(result.physical.adapter, dialect);
            assert.deepEqual(columns.binary_value.physicalType.args, [16]);
            assert.equal(columns.boolean_value.defaultValue.value, false);
            assert.deepEqual(columns.date_value.defaultValue, {kind: 'literal', value: '2024-02-29'});
            assert.deepEqual(columns.datetime_value.defaultValue, {
                implementation: 'currentTimestamp', kind: 'function', name: 'core.currentTimestamp',
            });
            assert.deepEqual(columns.decimal_value.physicalType.args, [10, 3]);
            assert.equal(columns.decimal_value.physicalType.unsigned, true);
            assert.deepEqual(columns.enum_value.physicalType.args, [['first', 'second']]);
            assert.equal(columns.id.physicalType.type, 'increments');
            assert.deepEqual(columns.integer_value.physicalType, {
                args: [], dialect, type: 'tinyint', unsigned: true,
            });
            assert.equal(columns.json_value.physicalType.type, 'jsonb');
            assert.equal(columns.number_value.physicalType.type, 'integer');
            assert.equal(columns.number_value.physicalType.unsigned, true);
            assert.deepEqual(columns.partial_value.physicalType.args, [9, undefined]);
            assert.deepEqual(columns.string_value.physicalType.args, [42]);
            assert.equal(columns.text_value.nullable, true);
            assert.equal(columns.text_value.comment, 'Text value.');
            assert.equal(childColumns.parent_ref.physicalType.type, 'integer');
            assert.equal(childColumns.parent_ref.physicalType.unsigned, true);

            const ordinary = result.physical.phases.tables.find((item) => item.name.endsWith('_ordinary'));
            assert.equal(ordinary.method, 'index');
            assert.deepEqual(ordinary.keys, [{attr: 'string_value'}]);
            assert.deepEqual(result.warnings.map((item) => item.code), [
                'DEM_V1_AMBIGUOUS_NUMBER',
                'DEM_V1_PARTIAL_DECIMAL',
            ]);
            assert.deepEqual(result.physical.phases.relations[0].action, {
                delete: 'cascade', update: 'restrict',
            });
        });
    }

    it('selects adapters only from explicit Knex client aliases', async () => {
        const registry = await container.get('TeqFw_Db_Back_RDb_Dialect_Registry$');
        assert.equal(registry.select({client: 'sqlite3'}), adapters.sqlite);
        assert.equal(registry.select({client: 'mysql2'}), adapters.mysql);
        assert.equal(registry.select({client: 'pg'}), adapters.postgresql);
        assert.throws(() => registry.select({client: 'oracle'}), /No @teqfw\/db dialect adapter/);
        assert(Object.isFrozen(registry));
        assert(Object.values(adapters).every(Object.isFrozen));
    });
});
