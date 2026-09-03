import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Shared/Enum/Direction.mjs';

test('Shared/Enum/Direction.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
