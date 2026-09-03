import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/RDb/IConnect.mjs';

test('Back/RDb/IConnect.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
