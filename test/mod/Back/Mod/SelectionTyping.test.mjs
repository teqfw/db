import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Mod_Selection} */
const selection = await container.get('TeqFw_Db_Back_Mod_Selection$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const postgresql = await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$');

let connection;

afterEach(async () => {
    await connection?.disconnect();
    connection = undefined;
});

async function knex() {
    connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    return connection.getKnex();
}

describe('Selection v2 typed schema boundary', () => {
    it('requires getLogicalTypes for v2 while retaining the legacy compatibility decoder', async () => {
        const db = await knex();
        const trx = {
            getDialectAdapter: () => connection.getDialectAdapter(),
            getKnexTrx: () => db,
        };
        const meta = {getAttributes: () => ({ID: 'id'})};
        await assert.rejects(
            selection.populate(trx, meta, db('item'), {version: 2}),
            /requires schema\.getLogicalTypes/,
        );
        await selection.populate(trx, meta, db('item'), {
            filter: {name: 'EQ', params: [{alias: 'id'}, {value: 1}]},
        });
    });

    it('allows descending secondary ordering when every distance term is ascending and limit is positive', async () => {
        const db = await knex();
        const adapter = Object.freeze({
            ...postgresql,
            applyExecutionOptions: async () => {},
            preflight: async () => Object.freeze({diagnostics: []}),
        });
        const trx = {getDialectAdapter: () => adapter, getKnexTrx: () => db};
        const meta = {
            attr: {
                embedding: {name: 'embedding', type: {id: 'core.vector', params: {dimensions: 3, element: 'float', sparse: false}}},
                id: {name: 'id', type: {id: 'core.integer', params: {bits: 32, unsigned: false}}},
            },
        };
        const distance = {
            kind: 'call', operator: 'postgresql.pgvector.l2Distance', args: [
                {kind: 'attr', name: 'embedding'},
                {kind: 'value', value: [1, 0, 0]},
            ],
        };
        const query = db('item').select('*');
        await selection.populate(trx, meta, query, {
            version: 2,
            orderBy: [
                {direction: 'asc', expression: distance},
                {direction: 'desc', expression: {kind: 'attr', name: 'id'}},
            ],
            limit: 5,
        });
        const sql = query.toSQL();
        assert.match(sql.sql, /order by .* asc, .* desc/i);
        assert.equal(sql.sql.includes('[1,0,0]'), false);

        await assert.rejects(selection.populate(trx, meta, db('item'), {
            version: 2,
            orderBy: [{direction: 'desc', expression: distance}],
            limit: 5,
        }), /distance ordering requires ascending/);
    });
});
