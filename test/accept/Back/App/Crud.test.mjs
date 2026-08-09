import assert from 'assert';
import {after, before, describe, it} from 'node:test';
import {container, dbConnect} from "../../../TestEnv.mjs";


/** @type {TeqFw_Db_Back_App_Crud} */
const crud = await container.get('TeqFw_Db_Back_App_Crud$');

// Mock schema for testing
class MockSchema {
    createDto = (dto) => ({id: dto.id, name: dto.name});
    getAttributes = () => ({ID: 'id', NAME: 'name'});
    getEntityName = () => '/test/teqfw/db/user';
    getLogicalTypes = () => ({
        id: {id: 'core.integer', params: {bits: 32, unsigned: false}},
        name: {id: 'core.string', params: {length: 255}},
    });
    getPrimaryKey = () => ['id'];
}

describe('TeqFw_Db_Back_App_Crud', () => {
    // Test variables
    let conn;
    let PK;
    const ENTITY_NAME = 'Test Entity';
    const UPDATED_NAME = 'Updated Entity';

    before(async () => {
        conn = await dbConnect();
        await conn.getSchemaBuilder().createTable("test_teqfw_db_user", (table) => {
            table.increments("id").primary();
            table.string("name");
        });
    });

    after(async () => {
        await conn.disconnect();
    });

    it('should successfully create a record', async () => {
        const schema = new MockSchema();
        const dto = {name: ENTITY_NAME};
        const {primaryKey} = await crud.createOne({schema, dto});
        PK = primaryKey;

        assert.ok(primaryKey, 'Primary key should exist after creation.');
    });

    it('should successfully read a single record', async () => {
        const schema = new MockSchema();
        const {record} = await crud.readOne({schema, key: PK});

        assert.ok(record, 'Record should exist.');
        assert.equal(record.name, ENTITY_NAME, 'Record name should match.');
    });

    it('should fail reading a non-existent record', async () => {
        const schema = new MockSchema();
        const {record} = await crud.readOne({schema, key: {id: -1}});

        assert.strictEqual(record, null, 'Non-existent record should return null.');
    });

    it('should successfully update a single record', async () => {
        const schema = new MockSchema();
        const updates = {name: UPDATED_NAME};
        const {updatedCount} = await crud.updateOne({schema, key: PK, updates});

        assert.strictEqual(updatedCount, 1, 'Exactly one record should be updated.');

        const {record} = await crud.readOne({schema, key: PK});
        assert.equal(record.name, UPDATED_NAME, 'Record name should be updated.');
    });

    it('should successfully delete a single record', async () => {
        const schema = new MockSchema();
        const {deletedCount} = await crud.deleteOne({schema, key: PK});

        assert.strictEqual(deletedCount, 1, 'Exactly one record should be deleted.');

        const {record} = await crud.readOne({schema, key: PK});
        assert.strictEqual(record, null, 'Record should no longer exist.');
    });

    it('should handle bulk operations', async () => {
        const schema = new MockSchema();

        // Create multiple records
        for (let i = 1; i <= 3; i++) {
            await crud.createOne({schema, dto: {id: i, name: ENTITY_NAME}});
        }

        // Update multiple records
        const updates = {name: UPDATED_NAME};
        const {updatedCount} = await crud.updateMany({
            schema,
            conditions: {name: ENTITY_NAME},
            updates,
        });
        assert.strictEqual(updatedCount, 3, 'All matching records should be updated.');

        // Delete multiple records
        const {deletedCount} = await crud.deleteMany({
            schema,
            conditions: {name: UPDATED_NAME},
        });
        assert.strictEqual(deletedCount, 3, 'All matching records should be deleted.');
    });

    it('should return empty results for no matching conditions', async () => {
        const schema = new MockSchema();

        const {records} = await crud.readMany({
            schema,
            conditions: {name: 'Non-Existent Name'},
        });

        assert.ok(Array.isArray(records), 'Records should be an array.');
        assert.strictEqual(records.length, 0, 'No records should match the condition.');
    });

    it('returns only declared derived Selection v2 aliases alongside persistent DTO fields', async () => {
        const schema = new MockSchema();
        await crud.createOne({schema, dto: {id: 50, name: ENTITY_NAME}});
        const {records} = await crud.readMany({
            schema,
            selection: {
                version: 2,
                select: [{as: 'derived_name', expression: {kind: 'attr', name: 'name'}}],
                where: {
                    kind: 'call', operator: 'core.eq', args: [
                        {kind: 'attr', name: 'id'}, {kind: 'value', value: 50},
                    ],
                },
            },
        });
        assert.deepEqual(records, [{derived_name: ENTITY_NAME, id: 50, name: ENTITY_NAME}]);
    });
});
