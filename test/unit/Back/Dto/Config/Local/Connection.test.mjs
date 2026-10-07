import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../../../src/Back/Dto/Config/Local/Connection.mjs';
import {Factory} from '../../../../../../src/Back/Dto/Config/Local/Connection.mjs';
import Cast from '../../../../../../src/Shared/Util/Cast.mjs';

test('Back/Dto/Config/Local/Connection.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

test('connection configuration preserves Unix socket paths and normalizes numeric ports', () => {
    const factory = new Factory({cast: new Cast()});
    const value = factory.create({socketPath: '/run/mysqld/mysqld.sock', port: '3306'});
    assert.equal(value.socketPath, '/run/mysqld/mysqld.sock');
    assert.equal(value.port, 3306);
    assert.equal(factory.create({}).socketPath, undefined);
});
