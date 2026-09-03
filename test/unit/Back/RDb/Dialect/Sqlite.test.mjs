import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../../src/Back/RDb/Dialect/Sqlite.mjs';

test('Back/RDb/Dialect/Sqlite.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
