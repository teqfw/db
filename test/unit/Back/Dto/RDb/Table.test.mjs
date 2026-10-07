import assert from 'node:assert/strict';
import {test} from 'node:test';
import subject from '../../../../../src/Back/Dto/RDb/Table.mjs';

test('Back/Dto/RDb/Table.mjs exposes its default unit contract', () => {
    assert.notEqual(subject, undefined);
});

import {container} from '../../../../TestEnv.mjs';

test('table factory normalizes nested columns, indexes, and relations', async () => {
    const factory = await container.get('TeqFw_Db_Back_Dto_RDb_Table__Factory$');
    const raw = {columns: [{name: 'title', length: '12'}], indexes: [{name: 'title_idx'}], relations: [{name: 'parent_fk'}]};
    const result = factory.create(raw);
    assert.equal(result.columns[0].length, 12);
    assert.notEqual(result.columns[0], raw.columns[0]);
    assert.equal(result.indexes[0].name, 'title_idx');
    assert.equal(result.relations[0].name, 'parent_fk');
    assert.deepEqual(factory.create().columns, []);
});
