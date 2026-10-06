import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import knexFactory from 'knex';
import {container} from '../../../../TestEnv.mjs';
import {compiler, identityCompilation, personEntity, emailEntity} from '../../../../data/Identity.mjs';

describe('allocated identity compilation and dialect projection', () => {
    it('projects ordinary 32/64-bit primary keys and derives cross-package references on every supported dialect', async () => {
        for (const [name, client] of [['Sqlite', 'sqlite3'], ['Postgresql', 'pg'], ['Mysql', 'mysql2']]) {
            const adapter = await container.get(`TeqFw_Db_Back_RDb_Dialect_${name}$`);
            const knex = knexFactory({client, useNullAsDefault: true});
            try {
                for (const bits of [32, 64]) {
                    const compilation = await identityCompilation(adapter, {bits});
                    const person = compilation.physical.tables.find((table) => table.entity === personEntity);
                    const email = compilation.physical.tables.find((table) => table.entity === emailEntity);
                    const id = person.columns.find((column) => column.name === 'id');
                    const ref = email.columns.find((column) => column.name === 'person_ref');
                    assert.equal(id.generation.implementation, 'allocated');
                    assert.equal(id.logicalType.params.bits, bits);
                    assert.deepEqual(id.logicalType, ref.logicalType);
                    assert.equal(ref.generation, undefined);
                    const sql = knex.schema.createTable(person.name, (tableBuilder) => {
                        for (const column of person.columns) adapter.addColumn({column, knex, tableBuilder});
                        for (const constraint of compilation.physical.phases.tables.filter((item) => item.entity === personEntity)) {
                            adapter.addConstraint({constraint, knex, tableBuilder});
                        }
                    }).toSQL().map((query) => query.sql).join(' ');
                    assert.match(sql, /primary key/i);
                    assert.match(sql, /not null/i);
                    assert.doesNotMatch(sql, /serial|auto_increment|autoincrement|generated\s/i);
                    assert.equal(compilation.provenance['/package/sample/package/people/entity/person'][0].fragmentId, 'people');
                }
            } finally { await knex.destroy(); }
        }
    });

    it('rejects unsupported modes deterministically and prohibits per-entity allocated generation', async () => {
        const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');
        for (const mode of ['unknown', 'Allocated', null]) {
            await assert.rejects(identityCompilation(adapter, {mode}), (error) => error.diagnostics.some((item) => item.code === 'DEM_GENERATION_INVALID'));
        }
        await assert.rejects(compiler.exec({
            adapter,
            fragments: [{declaration: {version: 2, entity: {item: {attr: {id: {
                type: {id: 'core.integer'}, generation: {kind: 'core.identity', params: {mode: 'allocated'}},
            }}}}}, filename: '/app/schema.json', packageName: 'app', fragmentId: 'app'}],
            mapEnvelope: {declaration: {version: 2}, filename: '/app/map.json', packageName: 'app', mapId: 'app:map'},
        }), (error) => error.diagnostics.some((item) => item.code === 'DEM_GENERATION_INVALID'));
    });

    it('validates the host profile even without identity attributes and retains the omitted-profile default', async () => {
        const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');
        const fragments = [{declaration: {version: 2, entity: {item: {attr: {id: {type: {id: 'core.identity'}}}}}},
            filename: '/app/schema.json', packageName: 'app', fragmentId: 'app'}];
        const mapEnvelope = {declaration: {version: 2}, filename: '/app/map.json', packageName: 'app', mapId: 'app:map'};
        const native = await compiler.exec({adapter, fragments, mapEnvelope});
        const column = native.physical.tables[0].columns[0];
        assert.deepEqual(column.logicalType, {id: 'core.integer', params: {bits: 32, unsigned: false}});
        assert.equal(column.generation.implementation, 'identity');
        assert.equal(column.generation.params.mode, 'byDefault');
        for (const params of [{mode: 'Allocated'}, null, []]) {
            await assert.rejects(compiler.exec({adapter, fragments: [], mapEnvelope: {...mapEnvelope,
                declaration: {version: 2, identityProfile: {type: {id: 'core.integer', params: {bits: 64, unsigned: false}},
                    generation: {kind: 'core.identity', params}}},
            }}), (error) => error.diagnostics.some((item) => ['DEM_GENERATION_INVALID', 'DEM_DECLARATION_SHAPE_INVALID'].includes(item.code)));
        }
    });
});
