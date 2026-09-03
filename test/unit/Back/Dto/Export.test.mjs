import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Back/Dto/Export.mjs';

test('Back/Dto/Export.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});
