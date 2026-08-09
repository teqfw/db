import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Mod_Expression} */
const expression = await container.get('TeqFw_Db_Back_Mod_Expression$');

let connection;

afterEach(async () => {
    await connection?.disconnect();
    connection = undefined;
});

async function input(type) {
    connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    return {
        adapter: connection.getDialectAdapter(),
        context: 'filter',
        entitySchema: {attr: {value: {name: 'value', type}}},
        knex: connection.getKnex(),
    };
}

function equality(value, type) {
    const node = {kind: 'value', value};
    if (type !== undefined) node.type = type;
    return {kind: 'call', operator: 'core.eq', args: [{kind: 'attr', name: 'value'}, node]};
}

describe('query core value registry', () => {
    it('rejects invalid calendar dates, decimal shapes, integer ranges, binary length, and non-JSON values', async () => {
        const matrix = [
            [{id: 'core.date', params: {}}, '2023-02-29'],
            [{id: 'core.decimal', params: {precision: 5, scale: 2, unsigned: false}}, '1234.56'],
            [{id: 'core.decimal', params: {precision: 5, scale: 2, unsigned: false}}, '1.234'],
            [{id: 'core.decimal', params: {precision: 5, scale: 2, unsigned: true}}, '-1.00'],
            [{id: 'core.integer', params: {bits: 8, unsigned: false}}, 128],
            [{id: 'core.integer', params: {bits: 8, unsigned: true}}, -1],
            [{id: 'core.binary', params: {length: 2}}, Buffer.from([1, 2, 3])],
            [{id: 'core.json', params: {}}, 1n],
        ];
        for (const [type, value] of matrix) {
            const context = await input(type);
            await assert.rejects(expression.exec({...context, expression: equality(value)}), (error) => {
                assert.equal(error.name, 'ExpressionCompilationError');
                assert.equal(error.diagnostics[0].code, 'DEM_EXPRESSION_INVALID');
                return true;
            });
            await connection.disconnect();
            connection = undefined;
        }
    });

    it('accepts exact boundary values after canonical type defaults', async () => {
        const context = await input({id: 'core.integer', params: {bits: 8}});
        const result = await expression.exec({...context, expression: equality(-128)});
        assert.equal(result.logicalType.id, 'core.boolean');
        assert.deepEqual(result.knexExpression.toSQL().bindings, [-128]);
    });

    it('rejects explicit core.any, unknown types, invalid parameters, and untyped v2 attributes', async () => {
        const context = await input({id: 'core.integer', params: {bits: 32, unsigned: false}});
        for (const type of [
            {id: 'core.any', params: {}},
            {id: 'vendor.raw', params: {}},
            {id: 'core.integer', params: {bits: 7, unsigned: false}},
        ]) {
            await assert.rejects(expression.exec({...context, expression: equality(1, type)}), /logical type|incompatible|inferred/i);
        }
        await assert.rejects(expression.exec({
            ...context,
            entitySchema: {attr: {value: {name: 'value'}}},
            expression: {kind: 'attr', name: 'value'},
        }), /no valid registered logical type/);
    });

    it('rejects cyclic JSON cleanly instead of overflowing deep-freeze recursion', async () => {
        const value = {};
        value.self = value;
        const context = await input({id: 'core.json', params: {}});
        await assert.rejects(expression.exec({...context, expression: equality(value)}), (error) => {
            assert.equal(error.name, 'ExpressionCompilationError');
            return true;
        });
    });
});
