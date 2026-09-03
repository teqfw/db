import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Shared/Dto/Order.mjs';

test('Shared/Dto/Order.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
