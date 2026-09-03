import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../../src/Back/RDb/Dialect/Registry.mjs';

test('Back/RDb/Dialect/Registry.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
