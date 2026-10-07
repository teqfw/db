import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/Schema.mjs';

test('Back/RDb/Schema.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

test('schema operations validate internal compilation without exposing an accessor', async () => {
    const firstTable = Object.freeze({entity: 'first', name: 'first'});
    const first = Object.freeze({physical: {tables: [firstTable]}, graph: {topological: ['first']}});
    const secondTable = Object.freeze({entity: 'second', name: 'second'});
    const second = Object.freeze({physical: {tables: [secondTable]}, graph: {topological: ['second']}});
    const accepted = new Set([first, second]);
    const schema = new subject({
        _compile: {assertResult({value}) {
            if (!accepted.has(value)) throw new TypeError('A successful DEM compilation result is required.');
            return value;
        }},
        logger: {forSource: () => ({})}, _builder: {}, _plan: {},
    });
    assert.equal('getCompilation' in schema, false);
    await assert.rejects(schema.fetchTablesByDependencyOrder(), /successful DEM compilation result/);
    schema.setCompilation({compilation: first});
    assert.deepEqual(await schema.fetchTablesByDependencyOrder(), [firstTable]);
    assert.throws(() => schema.setCompilation({compilation: {...first}}), /successful DEM compilation result/);
    assert.deepEqual(await schema.fetchTablesByDependencyOrder(), [firstTable]);
    schema.setCompilation({compilation: second});
    assert.deepEqual(await schema.fetchTablesByDependencyOrder(), [secondTable]);
});
