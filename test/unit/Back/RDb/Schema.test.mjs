import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/Schema.mjs';

test('Back/RDb/Schema.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

test('getCompilation validates state before exposing the installed result', () => {
    const first = Object.freeze({physical: Object.freeze({tables: []})});
    const second = Object.freeze({physical: Object.freeze({tables: []})});
    const accepted = new Set([first, second]);
    const schema = new subject({
        _compile: {assertResult({value}) {
            if (!accepted.has(value)) throw new TypeError('A successful DEM compilation result is required.');
            return value;
        }},
        logger: {forSource: () => ({})}, _builder: {}, _plan: {},
    });
    assert.throws(() => schema.getCompilation(), /successful DEM compilation result/);
    schema.setCompilation({compilation: first});
    assert.equal(schema.getCompilation(), first);
    assert.throws(() => schema.setCompilation({compilation: {...first}}), /successful DEM compilation result/);
    assert.equal(schema.getCompilation(), first);
    schema.setCompilation({compilation: second});
    assert.equal(schema.getCompilation(), second);
});
