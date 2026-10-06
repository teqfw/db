import assert from 'node:assert/strict';
import {test} from 'node:test';
import Subject, {__deps__} from '../../../../src/Back/RDb/Identity.mjs';
import {createHash} from 'node:crypto';

test('allocator rejects unauthenticated compilation before accessing a transaction', async () => {
    const allocator = new Subject({createHash, compile: {assertResult() { throw new TypeError('Not authentic'); }}});
    let accessed = false;
    await assert.rejects(allocator.allocate({compilation: {}, entity: '/item', transaction: {getKnexTrx() {accessed = true;}}}), /Not authentic/);
    assert.equal(accessed, false);
    assert.equal(__deps__.default.compile, 'TeqFw_Db_Back_Dem_Compile$');
    assert.equal(Object.isFrozen(allocator), true);
});
