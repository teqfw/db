import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/ITrans.mjs';

test('Back/RDb/ITrans.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
