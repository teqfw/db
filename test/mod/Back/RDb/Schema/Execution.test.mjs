import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container, dbConnect} from '../../../../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Builder_Execute} */
const execute = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder_Execute$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Plan} */
const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
/** @type {TeqFw_Db_Back_RDb_Schema} */
const schema = await container.get('TeqFw_Db_Back_RDb_Schema$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

let connection;

afterEach(async () => {
    await connection?.disconnect();
    connection = undefined;
});


async function compilation() {
    const integer = () => ({type: {id: 'core.integer', params: {bits: 32, unsigned: false}}});
    const identity = () => ({type: {id: 'core.identity'}});
    const relation = (path) => ({
        action: {delete: 'cascade'}, attrs: ['other_id'], deferrable: 'notDeferrable', ref: {attrs: ['id'], path},
    });
    const declaration = {
        version: 2, requires: [], package: {}, refs: {},
        entity: {
            alpha: {
                attr: {
                    born: {type: {id: 'core.date', params: {}}, default: {kind: 'literal', value: '2024-02-29'}},
                    created: {
                        type: {id: 'core.datetime', params: {timezone: false}},
                        default: {kind: 'function', name: 'core.currentTimestamp', params: {}},
                    },
                    id: identity(),
                    label: {type: {id: 'core.string', params: {length: 42}}},
                    other_id: integer(),
                },
                index: {}, relation: {other: relation('/beta')},
            },
            beta: {
                attr: {id: identity(), other_id: integer()},
                index: {}, relation: {other: relation('/alpha')},
            },
        },
    };
    return compile.exec({
        adapter,
        fragments: [{declaration, filename: '/fixtures/app/schema.json', fragmentId: 'app', packageName: 'app'}],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'teq'}, filename: '/fixtures/app/map.json', mapId: 'map', packageName: 'app',
        },
    });
}

describe('compiled schema execution', () => {
    it('creates cyclic SQLite structure with forwarded length and distinct literal/current defaults', async () => {
        connection = await dbConnect();
        const result = await compilation();
        schema.setCompilation({compilation: result});
        const createEvidence = await schema.createAllTables({conn: connection});
        assert.equal(createEvidence.status, 'complete');

        const sql = await connection.getKnex()('sqlite_master').select('sql').where({name: 'teq_alpha'}).first();
        assert.match(sql.sql, /varchar\(42\)/i);
        assert.match(sql.sql, /default '2024-02-29'/i);
        assert.match(sql.sql, /default CURRENT_TIMESTAMP/i);
        assert.match(sql.sql, /primary key/i);
        assert.match(sql.sql, /autoincrement/i);
        const alphaForeign = await connection.getKnex().raw('PRAGMA foreign_key_list(??)', ['teq_alpha']);
        const betaForeign = await connection.getKnex().raw('PRAGMA foreign_key_list(??)', ['teq_beta']);
        assert.equal(alphaForeign.length, 1);
        assert.equal(betaForeign.length, 1);
        assert.equal(alphaForeign[0].table, 'teq_beta');
        assert.equal(betaForeign[0].table, 'teq_alpha');

        const dropEvidence = await schema.dropAllTables({conn: connection});
        assert.equal(dropEvidence.status, 'complete');
        assert.equal(await connection.getSchemaBuilder().hasTable('teq_alpha'), false);
        assert.equal(await connection.getSchemaBuilder().hasTable('teq_beta'), false);
    });

    it('fails preflight before requesting any mutable schema builder', async () => {
        const result = await compilation();
        const plan = planner.exec({compilation: result, operation: 'create'});
        let schemaAccess = 0;
        const wrongConnection = {
            getKnex: () => ({client: {config: {client: 'pg'}}}),
            getSchemaBuilder: () => {
                schemaAccess++;
                throw new Error('must not be reached');
            },
        };
        await assert.rejects(
            execute.exec({adapter, connection: wrongConnection, plan}),
            (error) => error.name === 'DemPreflightError'
                && error.evidence.diagnostics[0].code === 'DEM_CAPABILITY_UNAVAILABLE',
        );
        assert.equal(schemaAccess, 0);
    });

    it('rejects unbranded state at the schema boundary', () => {
        assert.throws(() => schema.setCompilation({compilation: {physical: {}}}), /successful DEM compilation result/);
    });
});
