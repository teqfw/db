import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/App/Shutdown.mjs';

test('Back/App/Shutdown.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
