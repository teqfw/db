import assert from 'node:assert/strict';
import {after, before, describe, it} from 'node:test';
import {container, dbConnect} from '../../../TestEnv.mjs';

const crud = await container.get('TeqFw_Db_Back_App_Crud$');
let connection;

class MockSchema {
    createDto = (dto) => dto;
    getAttributes = () => ({ID: 'id', NAME: 'name'});
    getEntityName = () => '/hardening/item';
    getLogicalTypes = () => ({
        id: {id: 'core.integer', params: {bits: 32, unsigned: false}},
        name: {id: 'core.string', params: {length: 32}},
    });
    getPrimaryKey = () => ['id'];
}

describe('legacy CRUD registry boundary', () => {
    before(async () => {
        connection = await dbConnect();
    });

    after(async () => {
        await connection.disconnect();
    });

    it('does not accept caller-selected Knex operators in equality conditions', async () => {
        await assert.rejects(crud.readMany({
            conditions: {id: ['>=', 1]},
            schema: new MockSchema(),
        }), /accept equality values only/);
    });

    it('rejects unknown attributes and directions before applying legacy sorting', async () => {
        await assert.rejects(crud.readMany({
            schema: new MockSchema(), sorting: {undeclared: 'asc'},
        }), /Sorting attribute 'undeclared'/);
        await assert.rejects(crud.readMany({
            schema: new MockSchema(), sorting: {name: 'sideways'},
        }), /Sorting direction for 'name'/);
    });
});
