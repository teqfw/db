import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../src/Back/Util.mjs';

test('Back/Util.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
