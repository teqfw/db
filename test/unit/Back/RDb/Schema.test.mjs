import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/Schema.mjs';

test('Back/RDb/Schema.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
