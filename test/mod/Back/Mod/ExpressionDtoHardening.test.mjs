import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import ExpressionDto from '../../../../src/Shared/Dto/Query/Expression.mjs';
import {container} from '../../../TestEnv.mjs';

const factory = await container.get('TeqFw_Db_Shared_Dto_Query_Expression__Factory$');

describe('query expression DTO boundary', () => {
    it('revalidates manually constructed DTO-class instances as untrusted structures', () => {
        const forged = new ExpressionDto();
        forged.kind = 'attr';
        forged.name = 'id';
        forged.raw = 'drop table';
        assert.throws(() => factory.create(forged), /Unknown expression field 'raw'/);
    });

    it('returns independent deeply frozen values on repeated decoding', () => {
        const input = {kind: 'call', operator: 'core.notNull', args: [{kind: 'attr', name: 'id'}]};
        const first = factory.create(input);
        const second = factory.create(first);
        assert.notEqual(first, second);
        assert(Object.isFrozen(first.args[0]));
        assert(Object.isFrozen(second.args[0]));
    });
});
