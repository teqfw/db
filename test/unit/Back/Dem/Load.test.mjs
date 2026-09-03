import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Dem/Load.mjs';

test('Back/Dem/Load.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
