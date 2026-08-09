import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Mod_Selection} */
const selection = await container.get('TeqFw_Db_Back_Mod_Selection$');

let connection;
afterEach(async () => connection?.disconnect());

async function fixture() {
    connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    const knex = connection.getKnex();
    await knex.schema.createTable('item', (table) => {
        table.integer('id').primary();
        table.boolean('active').notNullable();
        table.integer('rank').notNullable();
        table.string('name', 64).nullable();
    });
    await knex('item').insert([
        {active: false, id: 1, name: '', rank: 0},
        {active: true, id: 2, name: null, rank: 1},
        {active: true, id: 3, name: 'third', rank: 2},
    ]);
    const trx = await connection.startTransaction();
    const meta = {
        attr: {
            active: {name: 'active', type: {id: 'core.boolean', params: {}}},
            id: {name: 'id', type: {id: 'core.integer', params: {bits: 32, unsigned: false}}},
            name: {name: 'name', type: {id: 'core.string', params: {length: 64}}},
            rank: {name: 'rank', type: {id: 'core.integer', params: {bits: 32, unsigned: false}}},
        },
    };
    return {meta, trx};
}

describe('TeqFw_Db_Back_Mod_Selection', () => {
    it('executes Selection v2 filters, derived projection, ordering, limit, and offset', async () => {
        const {meta, trx} = await fixture();
        const query = trx.createQuery().table('item').select('*');
        await selection.populate(trx, meta, query, {
            version: 2,
            where: {
                kind: 'call', operator: 'core.gte', args: [
                    {kind: 'attr', name: 'rank'}, {kind: 'value', value: 1},
                ],
            },
            select: [{as: 'lower_name', expression: {kind: 'call', operator: 'core.lower', args: [{kind: 'attr', name: 'name'}]}}],
            orderBy: [{direction: 'desc', expression: {kind: 'attr', name: 'rank'}}],
            limit: 1,
            offset: 0,
        });
        const rows = await query;
        assert.equal(rows.length, 1);
        assert.equal(rows[0].id, 3);
        assert.equal(rows[0].lower_name, 'third');
        await trx.commit();
    });

    it('decodes legacy falsy comparisons and null tests without fall-through', async () => {
        const {meta, trx} = await fixture();
        const falsy = trx.createQuery().table('item').select('*');
        await selection.populate(trx, meta, falsy, {
            filter: {
                with: 'AND', items: [
                    {name: 'EQ', params: [{alias: 'active'}, {value: false}]},
                    {name: 'EQ', params: [{alias: 'rank'}, {value: 0}]},
                    {name: 'EQ', params: [{alias: 'name'}, {value: ''}]},
                ],
            },
        });
        assert.deepEqual((await falsy).map((row) => row.id), [1]);

        const nulls = trx.createQuery().table('item').select('*');
        await selection.populate(trx, meta, nulls, {
            filter: {name: 'NULL', params: [{alias: 'name'}]},
        });
        const compiled = nulls.toSQL();
        assert.equal(compiled.sql.includes('undefined'), false);
        assert.deepEqual((await nulls).map((row) => row.id), [2]);
        await trx.commit();
    });

    it('keeps count filtering while omitting projection, ordering, pagination, and execution options', async () => {
        const {meta, trx} = await fixture();
        const query = trx.createQuery().table('item').count({count: '*'});
        await selection.populateCount(trx, meta, query, {
            version: 2,
            where: {kind: 'call', operator: 'core.gt', args: [{kind: 'attr', name: 'rank'}, {kind: 'value', value: 0}]},
            select: [{as: 'lower_name', expression: {kind: 'call', operator: 'core.lower', args: [{kind: 'attr', name: 'name'}]}}],
            orderBy: [{direction: 'desc', expression: {kind: 'attr', name: 'rank'}}],
            limit: 1,
            offset: 1,
            execution: {'unknown.option': 1},
        });
        const sql = query.toSQL().sql.toLowerCase();
        assert.equal(sql.includes('order by'), false);
        assert.equal(sql.includes('limit'), false);
        assert.equal(Number((await query)[0].count), 2);
        await trx.commit();
    });

    it('rejects unknown execution options before the main query executes', async () => {
        const {meta, trx} = await fixture();
        const query = trx.createQuery().table('item').select('*');
        await assert.rejects(selection.populate(trx, meta, query, {
            version: 2, execution: {'sqlite.raw': "'; drop table item; --"},
        }), /execution option is not registered/);
        assert.equal(await trx.getKnexTrx().schema.hasTable('item'), true);
        await trx.rollback();
    });

    it('rejects a derived alias that would overwrite a declared base field', async () => {
        const {meta, trx} = await fixture();
        const query = trx.createQuery().table('item').select('*');
        await assert.rejects(selection.populate(trx, meta, query, {
            version: 2,
            select: [{as: 'name', expression: {kind: 'attr', name: 'rank'}}],
        }), /conflicts with a base attribute/);
        await trx.rollback();
    });
});
