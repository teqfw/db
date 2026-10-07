import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../src/Shared/Util/Deep.mjs';

test('Shared/Util/Deep.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

test('merge preserves special keys as own data without changing prototypes', () => {
    const deep = new subject();
    const input = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"nested":{"__proto__":{"polluted":true}}}');
    const result = deep.merge({}, input);
    assert.deepEqual(result, input);
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal(Object.hasOwn(result, '__proto__'), true);
    assert.equal(result.polluted, undefined);
    assert.equal({}.polluted, undefined);
    const merged = deep.merge(result, JSON.parse('{"__proto__":{"other":1},"nested":{"extra":2}}'));
    assert.deepEqual(merged.__proto__, {polluted: true, other: 1});
    assert.equal(Object.getPrototypeOf(merged), Object.prototype);
    assert.equal(Object.getPrototypeOf(merged.nested), Object.prototype);
    assert.equal(merged.nested.polluted, undefined);
    assert.equal(merged.nested.extra, 2);
});

test('merge ignores inherited target values and preserves normal merge behavior', () => {
    const target = Object.create({inherited: {hidden: true}});
    target.list = [1];
    target.nested = {left: 1};
    const result = new subject().merge(target, {inherited: {own: true}, list: [2], nested: {right: 2}});
    assert.deepEqual(result.inherited, {own: true});
    assert.deepEqual(result.list, [1, 2]);
    assert.deepEqual(result.nested, {left: 1, right: 2});
});
