import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container, localCfg} from '../TestEnv.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
const builder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Plan} */
const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
/** @type {TeqFw_Db_Back_RDb_Rebuild} */
const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');

const tableNames = new Set();
const connections = [];

async function connect() {
    const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await connection.init({...localCfg.mariadb, acquireConnectionTimeout: 5000});
    connections.push(connection);
    return connection;
}

function integer(generated = false) {
    const result = {type: {id: 'core.integer', params: {bits: 32, unsigned: false}}};
    if (generated) result.generation = {kind: 'core.identity', params: {mode: 'byDefault'}};
    return result;
}

function primary() {
    return {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'};
}

function declaration() {
    return {
        version: 2, package: {}, refs: {}, requires: [],
        entity: {
            parent: {
                attr: {
                    created: {
                        default: {kind: 'function', name: 'core.currentTimestamp', params: {}},
                        type: {id: 'core.datetime', params: {precision: 0, timezone: false}},
                    },
                    day: {
                        default: {kind: 'literal', value: '2026-08-09'},
                        type: {id: 'core.date', params: {}},
                    },
                    id: integer(true),
                    name: {type: {id: 'core.string', params: {length: 37}}},
                },
                index: {pk: primary()},
                relation: {},
            },
            child: {
                attr: {id: integer(true), parent_id: integer()},
                index: {
                    parent_lookup: {
                        include: [], keys: [{attr: 'parent_id'}], kind: 'index', method: 'core.btree',
                        options: {}, phase: 'afterData',
                    },
                    pk: primary(),
                },
                relation: {
                    parent: {
                        action: {delete: 'cascade', update: 'restrict'},
                        attrs: ['parent_id'],
                        deferrable: 'notDeferrable',
                        ref: {attrs: ['id'], path: '/parent'},
                    },
                },
            },
        },
    };
}

function cycleDeclaration() {
    const relation = (path, attr) => ({
        action: {delete: 'restrict', update: 'restrict'}, attrs: [attr], deferrable: 'notDeferrable',
        ref: {attrs: ['id'], path},
    });
    return {
        version: 2, package: {}, refs: {}, requires: [],
        entity: {
            left: {
                attr: {id: integer(), right_id: integer()}, index: {pk: primary()},
                relation: {right: relation('/right', 'right_id')},
            },
            right: {
                attr: {id: integer(), left_id: integer()}, index: {pk: primary()},
                relation: {left: relation('/left', 'left_id')},
            },
        },
    };
}

async function compilation(adapter, namespace, value) {
    const result = await compile.exec({
        adapter,
        fragments: [{declaration: value, filename: `/opt/${namespace}/schema.json`, fragmentId: namespace, packageName: namespace}],
        mapEnvelope: {
            declaration: {version: 2, namespace}, filename: `/opt/${namespace}/map.json`,
            mapId: `${namespace}:map`, packageName: namespace,
        },
    });
    for (const table of result.physical.tables) tableNames.add(table.name);
    return result;
}

async function create(connection, result) {
    await builder.exec({
        adapter: connection.getDialectAdapter(), connection,
        plan: planner.exec({compilation: result, operation: 'create'}),
    });
}

async function decodedRows(connection, compilationResult, entity) {
    const adapter = connection.getDialectAdapter();
    const table = compilationResult.physical.tables.find((item) => item.entity === entity);
    if (!table) throw new TypeError(`Physical table for '${entity}' is absent.`);
    const rows = await connection.getClient()(table.name).select().orderBy('id');
    return rows.map((row) => Object.fromEntries(table.columns.map((column) => [
        column.name,
        adapter.decodeValue({column, value: row[column.name]}),
    ])));
}

async function cleanup() {
    for (const connection of connections) {
        const knex = connection.getClient();
        try {
            await knex.raw('set foreign_key_checks = 0');
            for (const table of [...tableNames].reverse()) await knex.schema.dropTableIfExists(table);
        } catch {
            // The primary test failure is reported separately.
        } finally {
            try { await knex.raw('set foreign_key_checks = 1'); } catch {}
        }
    }
    while (connections.length) await connections.pop().disconnect();
}

describe('opt-in MySQL/MariaDB', () => {
    it('passes adapter, DDL, rebuild, generated value, index, and cyclic schema conformance', async () => {
        try {
            const source = await connect();
            const target = await connect();
            const adapter = source.getDialectAdapter();
            assert.equal((await adapter.describe()).id, 'mysql');

            const sourceCompilation = await compilation(adapter, 'optmysrc', declaration());
            const targetCompilation = await compilation(adapter, 'optmytgt', declaration());
            const preflight = await adapter.preflight({
                connection: source, fingerprint: sourceCompilation.fingerprint,
                operation: 'create', requirements: sourceCompilation.requirements,
            });
            assert.deepEqual(preflight.diagnostics, []);
            await create(source, sourceCompilation);

            await source.getClient()('optmysrc_parent').insert([
                {created: new Date('2026-08-09T00:00:00Z'), day: '2026-08-09', id: 10, name: 'first'},
                {created: new Date('2026-08-09T00:00:00Z'), day: '2026-08-09', id: 20, name: 'second'},
            ]);
            await source.getClient()('optmysrc_child').insert([{id: 10, parent_id: 10}, {id: 20, parent_id: 20}]);

            const evidence = await rebuild.exec({
                compilation: targetCompilation,
                mode: 'parallel',
                source,
                sourceCompilation,
                sourceId: 'mysql-source',
                target,
                targetId: 'mysql-target',
            });
            assert.equal(evidence.status, 'complete');
            assert.equal(evidence.transaction.outcome, 'committed');
            assert.deepEqual(evidence.tables.map((item) => item.targetRows), [2, 2]);
            assert.equal(evidence.phases.findIndex((item) => item.phase === 'afterData')
                > evidence.phases.findIndex((item) => item.phase === 'data'), true);
            assert.deepEqual(await decodedRows(target, targetCompilation, '/parent'),
                await decodedRows(source, sourceCompilation, '/parent'));

            const columns = await target.getClient()('information_schema.columns')
                .select('column_name', 'column_default', 'character_maximum_length')
                .where({table_schema: localCfg.mariadb.connection.database, table_name: 'optmytgt_parent'});
            const byName = Object.fromEntries(columns.map((item) => [item.column_name, item]));
            assert.equal(Number(byName.name.character_maximum_length), 37);
            assert.match(String(byName.day.column_default), /2026-08-09/);
            assert.match(String(byName.created.column_default).toLowerCase(), /current_timestamp/);

            const indexes = await target.getClient()('information_schema.statistics')
                .select('index_name').where({
                    table_schema: localCfg.mariadb.connection.database,
                    table_name: 'optmytgt_child',
                });
            assert.ok(indexes.some((item) => item.index_name === 'optmytgt_child_parent_lookup'));

            const inserted = await target.getClient()('optmytgt_parent').insert({name: 'generated'});
            assert.equal(Number(inserted[0]), 21);
            assert.equal(await source.getClient()('optmysrc_parent').count({count: '*'}).first().then((row) => Number(row.count)), 2);

            const cyclic = await compilation(adapter, 'optmycyc', cycleDeclaration());
            await create(target, cyclic);
            const constraints = await target.getClient()('information_schema.referential_constraints')
                .count({count: '*'})
                .where({constraint_schema: localCfg.mariadb.connection.database})
                .whereIn('table_name', ['optmycyc_left', 'optmycyc_right'])
                .first();
            assert.equal(Number(constraints.count), 2);
            assert.throws(() => planner.exec({
                compilation: cyclic, includeData: true, operation: 'transfer',
            }), /explicit adapter-validated strategy/);
        } finally {
            await cleanup();
        }
    });
});
