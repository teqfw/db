import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container, dbConnect} from '../../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Builder_Execute} */
const execute = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder_Execute$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Plan} */
const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const sqlite = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

let connection;

afterEach(async () => {
    if (connection) {
        await connection.getSchemaBuilder().dropTableIfExists('teq_parent');
        await connection.disconnect();
    }
    connection = undefined;
});

describe('schema failed-operation evidence', () => {
    it('marks a required late-index failure unsuccessful with its phase and identity', async () => {
        const declaration = {
            version: 2, requires: [], package: {}, refs: {},
            entity: {
                parent: {
                    attr: {id: {type: {id: 'core.integer', params: {bits: 32, unsigned: false}}}},
                    index: {
                        pk: {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'},
                        late: {
                            include: [], keys: [{attr: 'id'}], kind: 'index', method: 'core.btree',
                            options: {}, phase: 'afterData',
                        },
                    },
                    relation: {},
                },
            },
        };
        const compilation = await compile.exec({
            adapter: sqlite,
            fragments: [{declaration, filename: '/fixtures/schema.json', fragmentId: 'app', packageName: 'app'}],
            mapEnvelope: {
                declaration: {version: 2, namespace: 'teq'}, filename: '/fixtures/map.json', mapId: 'map', packageName: 'app',
            },
        });
        const adapter = Object.freeze({...sqlite, addIndex: async () => {
            throw new Error('required late index failed');
        }});
        connection = await dbConnect();

        await assert.rejects(
            execute.exec({adapter, connection, plan: planner.exec({compilation, operation: 'create'})}),
            (error) => {
                assert.equal(error.name, 'DemSchemaExecutionError');
                assert.equal(error.evidence.status, 'failed');
                assert.deepEqual(error.evidence.phases.at(-1), {
                    error: {message: 'required late index failed', name: 'Error'},
                    identity: 'teq_parent_late',
                    phase: 'afterData',
                    status: 'failed',
                });
                assert.equal(error.evidence.phases.some((item) => item.phase === 'verification'), false);
                return true;
            },
        );
    });
});
