import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Cli/Drop.mjs';

test('Back/Cli/Drop.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
