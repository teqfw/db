import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import knexFactory from 'knex';
import {container} from '../../../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$');
/** @type {TeqFw_Db_Back_Mod_Expression} */
const expression = await container.get('TeqFw_Db_Back_Mod_Expression$');

const vectorTypes = Object.freeze({
    bit: {dimensions: 8, element: 'bit', sparse: false},
    halfvec: {dimensions: 3, element: 'float', sparse: false},
    sparsevec: {dimensions: 8, element: 'float', sparse: true},
    vector: {dimensions: 3, element: 'float', sparse: false},
});

function attribute(storage) {
    return {
        nullable: false,
        storage: {postgresql: {type: storage, params: {}}},
        type: {id: 'core.vector', params: vectorTypes[storage]},
    };
}

function declaration() {
    const attr = {
        bits: attribute('bit'),
        dense: attribute('vector'),
        half: attribute('halfvec'),
        id: {type: {id: 'core.integer', params: {bits: 32, unsigned: false}}},
        sparse: attribute('sparsevec'),
    };
    const index = {
        pk: {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'},
    };
    const matrix = [
        ['hnsw', 'bits', ['bit_hamming_ops', 'bit_jaccard_ops']],
        ['hnsw', 'dense', ['vector_l2_ops', 'vector_ip_ops', 'vector_cosine_ops', 'vector_l1_ops']],
        ['hnsw', 'half', ['halfvec_l2_ops', 'halfvec_ip_ops', 'halfvec_cosine_ops', 'halfvec_l1_ops']],
        ['hnsw', 'sparse', ['sparsevec_l2_ops', 'sparsevec_ip_ops', 'sparsevec_cosine_ops', 'sparsevec_l1_ops']],
        ['ivfflat', 'bits', ['bit_hamming_ops']],
        ['ivfflat', 'dense', ['vector_l2_ops', 'vector_ip_ops', 'vector_cosine_ops']],
        ['ivfflat', 'half', ['halfvec_l2_ops', 'halfvec_ip_ops', 'halfvec_cosine_ops']],
    ];
    for (const [method, name, classes] of matrix) {
        for (const operatorClass of classes) {
            const identity = `${method}_${name}_${operatorClass}`;
            index[identity] = {
                include: [],
                keys: [{attr: name, operatorClass: `postgresql.${operatorClass}`}],
                kind: 'index',
                method: `postgresql.${method}`,
                options: method === 'hnsw' ? {m: 16, ef_construction: 64} : {lists: 1},
                phase: method === 'hnsw' ? 'afterRelations' : 'afterData',
            };
        }
    }
    index.hnsw_partial = {
        include: [],
        keys: [{attr: 'dense', operatorClass: 'postgresql.vector_cosine_ops'}],
        kind: 'index',
        method: 'postgresql.hnsw',
        options: {},
        phase: 'afterData',
        predicate: {kind: 'call', operator: 'core.notNull', args: [{kind: 'attr', name: 'dense'}]},
    };
    return {
        version: 2,
        entity: {item: {attr, index, relation: {}}},
        package: {},
        refs: {},
        requires: [],
    };
}

async function compile(value = declaration()) {
    return compiler.exec({
        adapter,
        fragments: [{
            declaration: value,
            filename: '/fixture/pgvector/etc/teqfw.schema.json',
            fragmentId: 'pgvector',
            packageName: 'pgvector',
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'test'},
            filename: '/fixture/app/etc/teqfw.schema.map.json',
            mapId: 'app',
            packageName: 'app',
        },
    });
}

function mockConnection(version) {
    const database = function (table) {
        assert.equal(table, 'pg_extension');
        return {
            first: async () => version === null ? undefined : {extversion: version},
            select() { return this; },
            where(value) { assert.deepEqual(value, {extname: 'vector'}); return this; },
        };
    };
    database.client = {config: {client: 'pg'}};
    return {getKnex: () => database};
}

describe('PostgreSQL pgvector adapter', () => {
    it('projects all storage families and the complete HNSW/IVFFlat operator-class matrix', async () => {
        const result = await compile();
        const columns = Object.fromEntries(result.physical.tables[0].columns.map((item) => [item.name, item.physicalType]));
        assert.deepEqual(columns.bits.args, [8]);
        assert.equal(columns.bits.type, 'bit');
        assert.equal(columns.dense.type, 'vector');
        assert.equal(columns.half.type, 'halfvec');
        assert.equal(columns.sparse.type, 'sparsevec');
        assert.equal(result.physical.phases.afterRelations.length, 14);
        assert.equal(result.physical.phases.afterData.length, 8);
        assert.ok(result.requirements.includes('postgresql.extension.vector'));
        assert.ok(result.requirements.includes('postgresql.index.hnsw'));
        assert.ok(result.requirements.includes('postgresql.index.ivfflat'));
    });

    it('rejects incompatible storage, cross-matrix classes, phases, and option ranges during compilation', async () => {
        const value = declaration();
        value.entity.item.attr.bits.storage.postgresql.type = 'vector';
        value.entity.item.index.hnsw_partial.keys[0].operatorClass = 'postgresql.bit_hamming_ops';
        value.entity.item.index.hnsw_partial.options = {m: 1, injected: 'x'};
        value.entity.item.index.hnsw_partial.method = 'postgresql.ivfflat';
        value.entity.item.index.hnsw_partial.phase = 'afterRelations';
        await assert.rejects(compile(value), (error) => {
            assert.equal(error.name, 'DemCompilationError');
            assert.ok(error.diagnostics.some((item) => item.code === 'DEM_STORAGE_UNSUPPORTED'));
            assert.ok(error.diagnostics.filter((item) => item.code === 'DEM_INDEX_INVALID').length >= 3);
            return true;
        });
    });

    it('round-trips canonical dense, half, bit, and sparse values and rejects malformed values', () => {
        const values = {
            bit: '01010101',
            halfvec: [1, -2, 3.5],
            sparsevec: {dimensions: 8, entries: [{index: 1, value: 2}, {index: 8, value: -1}]},
            vector: [1, -2, 3.5],
        };
        for (const storage of Object.keys(values)) {
            const column = {logicalType: {id: 'core.vector', params: vectorTypes[storage]}, physicalType: {type: storage}};
            const encoded = adapter.encodeValue({column, value: values[storage]});
            assert.deepEqual(adapter.decodeValue({column, value: encoded}), values[storage]);
        }
        assert.throws(() => adapter.encodeValue({
            column: {logicalType: {id: 'core.vector', params: vectorTypes.vector}}, value: [1, 2],
        }), /canonical vector/);
        assert.throws(() => adapter.encodeValue({
            column: {logicalType: {id: 'core.vector', params: vectorTypes.sparsevec}},
            value: {dimensions: 8, entries: [{index: 2, value: 0}]},
        }), /canonical vector/);
    });

    it('compiles every distance as a fixed operator with a bound canonical query value', async () => {
        const knex = knexFactory({client: 'pg'});
        const operations = {
            cosineDistance: '<=>', hammingDistance: '<~>', jaccardDistance: '<%>', l1Distance: '<+>',
            l2Distance: '<->', negativeInnerProduct: '<#>',
        };
        for (const [name, token] of Object.entries(operations)) {
            const bit = name === 'hammingDistance' || name === 'jaccardDistance';
            const params = bit ? vectorTypes.bit : vectorTypes.vector;
            const value = bit ? '01010101' : [1, 2, 3];
            const compiled = await expression.exec({
                adapter,
                context: 'ordering',
                entitySchema: {attr: {embedding: {logicalType: {id: 'core.vector', params}, name: 'embedding'}}},
                expression: {
                    kind: 'call', operator: `postgresql.pgvector.${name}`, args: [
                        {kind: 'attr', name: 'embedding'}, {kind: 'value', value},
                    ],
                },
                knex,
            });
            const sql = compiled.knexExpression.toSQL();
            assert.ok(sql.sql.includes(token));
            assert.deepEqual(sql.bindings, [bit ? value : '[1,2,3]']);
            assert.ok(compiled.requirements.includes('postgresql.query.vectorDistance'));
        }
        await knex.destroy();
    });

    it('preflights extension presence/version without provisioning it', async () => {
        const requirements = ['postgresql.core', 'postgresql.extension.vector'];
        const current = await adapter.preflight({
            connection: mockConnection('0.7.0'), fingerprint: 'fp', operation: 'create', requirements,
        });
        assert.deepEqual(current.diagnostics, []);
        assert.equal(current.extensions.vector.installed, '0.7.0');

        for (const version of [null, '0.6.2']) {
            const result = await adapter.preflight({
                connection: mockConnection(version), fingerprint: 'fp', operation: 'create', requirements,
            });
            assert.ok(result.diagnostics.some((item) => item.code === 'DEM_CAPABILITY_UNAVAILABLE'));
            assert.equal(result.availableCapabilities.includes('postgresql.extension.vector'), false);
        }
    });

    it('applies only validated transaction-local options with bound set_config values', async () => {
        const calls = [];
        const trx = {
            isTransaction: true,
            raw: async (sql, bindings) => calls.push({bindings, sql}),
        };
        await adapter.applyExecutionOptions({
            execution: {'postgresql.hnsw.ef_search': 100, 'postgresql.ivfflat.probes': 10}, knex: trx,
        });
        assert.deepEqual(calls, [
            {bindings: ['hnsw.ef_search', '100'], sql: 'select set_config(?, ?, true)'},
            {bindings: ['ivfflat.probes', '10'], sql: 'select set_config(?, ?, true)'},
        ]);
        await assert.rejects(adapter.applyExecutionOptions({
            execution: {'postgresql.hnsw.ef_search': '1; reset all'}, knex: trx,
        }), /outside its registered range/);
        assert.equal(calls.length, 2);
        await assert.rejects(adapter.applyExecutionOptions({
            execution: {'postgresql.hnsw.ef_search': 10}, knex: {raw: async () => undefined},
        }), /active transaction/);
    });

    it('renders pgvector index identifiers as bindings and rejects forged physical options', async () => {
        const calls = [];
        const raw = function (sql, bindings) {
            const value = {bindings, sql};
            calls.push(value);
            return value;
        };
        await adapter.addIndex({
            connection: {}, knex: {raw}, table: {name: 'odd"table'},
            index: {
                keys: [{attr: 'odd"column', operatorClass: 'vector_l2_ops'}], kind: 'index', method: 'hnsw',
                name: 'odd"index', options: {m: 16, ef_construction: 64},
            },
        });
        assert.equal(calls.at(-1).sql, 'CREATE INDEX ?? ON ?? USING hnsw (?? vector_l2_ops) WITH (m = 16, ef_construction = 64)');
        assert.deepEqual(calls.at(-1).bindings, ['odd"index', 'odd"table', 'odd"column']);
        await assert.rejects(adapter.addIndex({
            connection: {}, knex: {raw}, table: {name: 'item'},
            index: {
                keys: [{attr: 'embedding', operatorClass: 'vector_l2_ops'}], kind: 'index', method: 'hnsw',
                name: 'forged', options: {m: '16) reset all --'},
            },
        }), /physical index option/);
    });
});
