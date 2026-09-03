import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/Rebuild.mjs';

test('Back/RDb/Rebuild.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
