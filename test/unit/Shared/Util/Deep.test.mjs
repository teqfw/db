import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Shared/Util/Deep.mjs';

test('Shared/Util/Deep.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
