import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject, {serialsGet, serialsGetOne} from '../../../src/Back/Util.mjs';
import knex from 'knex';

test('Back/Util.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

function serialSchema(rows = []) {
    const calls = [];
    return {
        calls,
        raw(sql, bindings) { calls.push({sql, bindings}); },
        then(resolve, reject) { return Promise.resolve({rows}).then(resolve, reject); },
    };
}

test('sequence helpers bind hostile names and retain each sequence value', async () => {
    const names = ["seq'); SELECT pg_sleep(1); --", '__proto__'];
    const schema = serialSchema([{nextval: 11}, {nextval: 22}]);
    const result = await serialsGet(schema, names);
    assert.equal(result[names[0]], 11);
    assert.equal(Object.hasOwn(result, '__proto__'), true);
    assert.equal(result.__proto__, 22);
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.deepEqual(schema.calls, names.map((name) => ({sql: 'SELECT nextval(?::regclass)', bindings: [name]})));
    const client = knex({client: 'pg'});
    const query = client.raw(schema.calls[0].sql, schema.calls[0].bindings).toSQL().toNative();
    assert.equal(query.sql, 'SELECT nextval($1::regclass)');
    assert.deepEqual(query.bindings, [names[0]]);
    const one = serialSchema([{nextval: 33}]);
    assert.equal(await serialsGetOne(one, names[0]), 33);
    assert.deepEqual(one.calls, [{sql: 'SELECT nextval(?::regclass)', bindings: [names[0]]}]);
});

test('sequence restoration validates all values before queuing SQL', async () => {
    const util = new subject();
    for (const value of ['1); DROP TABLE users; --', '9223372036854775808', '-9223372036854775809', Infinity, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        const schema = serialSchema();
        await assert.rejects(util.pgSerialsSet(schema, {valid: 1, invalid: value}), /safe integers/);
        assert.deepEqual(schema.calls, []);
    }
    const name = "seq'); DROP TABLE users; --";
    const schema = serialSchema();
    await util.pgSerialsSet(schema, {[name]: 7, bigint: '9223372036854775807', negative: '-9223372036854775808', skipped: null});
    assert.deepEqual(schema.calls, [
        {sql: 'SELECT setval(?::regclass, ?)', bindings: [name, 7]},
        {sql: 'SELECT setval(?::regclass, ?)', bindings: ['bigint', '9223372036854775807']},
        {sql: 'SELECT setval(?::regclass, ?)', bindings: ['negative', '-9223372036854775808']},
    ]);
});

test('catalog sequence names are bound rather than interpolated', async () => {
    const name = "seq'); SELECT pg_sleep(1); --";
    const calls = [];
    const trx = {async raw(sql, bindings) {
        calls.push({sql, bindings});
        return {rows: bindings ? [{nextval: 4}] : [{sequence_name: name}]};
    }};
    assert.deepEqual(await new subject().pgSerialsGet(trx), {[name]: 4});
    assert.deepEqual(calls[1], {sql: 'SELECT nextval(?::regclass)', bindings: [name]});
});
