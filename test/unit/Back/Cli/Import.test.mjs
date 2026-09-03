import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Cli/Import.mjs';

test('Back/Cli/Import.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
