import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../../src/Back/Dem/Registry/Core.mjs';

test('Back/Dem/Registry/Core.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
