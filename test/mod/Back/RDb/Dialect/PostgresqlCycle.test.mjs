import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';

const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Postgresql$');

describe('PostgreSQL cyclic transfer strategy registry', () => {
    it('accepts only the named strategy when every internal edge is deferred', () => {
        const cycles = [{relations: [{deferrable: 'deferred'}, {deferrable: 'deferred'}]}];
        const accepted = adapter.validateCycleStrategy({
            cycles, strategy: {id: 'postgresql.deferredConstraints'},
        });
        assert.equal(accepted.valid, true);
        assert.deepEqual(accepted.requirements, ['postgresql.transfer.deferredConstraints']);

        assert.equal(adapter.validateCycleStrategy({
            cycles: [{relations: [{deferrable: 'deferred'}, {deferrable: 'immediate'}]}],
            strategy: {id: 'postgresql.deferredConstraints'},
        }).valid, false);
        assert.equal(adapter.validateCycleStrategy({
            cycles, strategy: {id: 'postgresql.unknown'},
        }).valid, false);
    });
});
