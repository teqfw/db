import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Plugin/Stop.mjs';

test('Back/Plugin/Stop.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
