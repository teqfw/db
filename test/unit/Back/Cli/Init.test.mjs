import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Cli/Init.mjs';

test('Back/Cli/Init.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
