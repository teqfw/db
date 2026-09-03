import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Mod/Selection.mjs';

test('Back/Mod/Selection.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
