import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/Connect.mjs';

test('Back/RDb/Connect.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
