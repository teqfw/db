import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Mod_Expression} */
const expression = await container.get('TeqFw_Db_Back_Mod_Expression$');
/** @type {TeqFw_Db_Shared_Dto_Query_Expression.Factory} */
const expressionFactory = await container.get('TeqFw_Db_Shared_Dto_Query_Expression__Factory$');
/** @type {TeqFw_Db_Shared_Dto_Query_Selection.Factory} */
const selectionFactory = await container.get('TeqFw_Db_Shared_Dto_Query_Selection__Factory$');

let connection;
afterEach(async () => connection?.disconnect());

async function context() {
    connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true});
    const knex = connection.getKnex();
    return {
        adapter: connection.getDialectAdapter(),
        entitySchema: {
            attr: {
                active: {name: 'active', type: {id: 'core.boolean', params: {}}},
                id: {name: 'id', type: {id: 'core.integer', params: {bits: 32, unsigned: false}}},
                name: {name: 'name', type: {id: 'core.string', params: {length: 64}}},
            },
        },
        knex,
    };
}

describe('query DTOs and typed expression compiler', () => {
    it('preserves falsy values and rejects open or ambiguous expression shapes', () => {
        assert.equal(expressionFactory.create({kind: 'value', value: 0}).value, 0);
        assert.equal(expressionFactory.create({kind: 'value', value: false}).value, false);
        assert.equal(expressionFactory.create({kind: 'value', value: ''}).value, '');
        assert.throws(() => expressionFactory.create({kind: 'attr', name: 'id', raw: 'drop table'}), /Unknown expression field/);
        assert.throws(() => expressionFactory.create({kind: 'value'}), /requires a value field/);
        const selection = selectionFactory.create({version: 2});
        assert.deepEqual(selection.orderBy, []);
        assert.deepEqual(selection.execution, {});
        assert(Object.isFrozen(selection));
        assert.throws(() => selectionFactory.create({version: 2, sql: 'select 1'}), /Unknown selection field/);
    });

    it('compiles identifiers and hostile values as bindings', async () => {
        const input = await context();
        const hostile = "x' OR 1=1 --";
        const result = await expression.exec({
            ...input,
            context: 'filter',
            expression: {
                kind: 'call', operator: 'core.eq', args: [
                    {kind: 'attr', name: 'name'},
                    {kind: 'value', value: hostile},
                ],
            },
        });
        const sql = result.knexExpression.toSQL();
        assert.equal(sql.sql.includes(hostile), false);
        assert.deepEqual(sql.bindings, [hostile]);
        assert.equal(result.logicalType.id, 'core.boolean');
    });

    it('rejects unknown attributes/operators, wrong arity, types, and contexts', async () => {
        const input = await context();
        const invalid = [
            [{kind: 'attr', name: 'missing'}, 'filter'],
            [{kind: 'call', operator: 'vendor.raw', args: []}, 'filter'],
            [{kind: 'call', operator: 'core.eq', args: [{kind: 'attr', name: 'id'}]}, 'filter'],
            [{kind: 'call', operator: 'core.gt', args: [{kind: 'attr', name: 'id'}, {kind: 'value', value: 'wrong'}]}, 'filter'],
            [{kind: 'call', operator: 'core.eq', args: [{kind: 'attr', name: 'id'}, {kind: 'value', value: 1}]}, 'projection'],
        ];
        for (const [node, contextName] of invalid) {
            await assert.rejects(expression.exec({...input, context: contextName, expression: node}), (error) => {
                assert.equal(error.name, 'ExpressionCompilationError');
                assert.equal(error.diagnostics[0].code, 'DEM_EXPRESSION_INVALID');
                return true;
            });
        }
    });
});
