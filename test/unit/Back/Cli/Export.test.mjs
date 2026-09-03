import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Cli/Export.mjs';

test('Back/Cli/Export.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
