import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../../../src/Back/Dem/Compile/A/Fingerprint.mjs';
import {createHash} from 'node:crypto';

test('Back/Dem/Compile/A/Fingerprint.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

test('fingerprints retain special JSON keys at every depth', () => {
    const fingerprint = new subject({createHash});
    const special = JSON.parse('{"__proto__":{"marker":true}}');
    assert.notEqual(fingerprint.exec({value: special}), fingerprint.exec({value: {}}));
    assert.notEqual(fingerprint.exec({value: {nested: special}}), fingerprint.exec({value: {nested: {}}}));
    assert.equal(fingerprint.exec({value: special}), `sha256-v1:${createHash('sha256').update(JSON.stringify(special)).digest('hex')}`);
    assert.equal(fingerprint.exec({value: {b: 2, a: 1}}), fingerprint.exec({value: {a: 1, b: 2}}));
    assert.equal({}.marker, undefined);
});
