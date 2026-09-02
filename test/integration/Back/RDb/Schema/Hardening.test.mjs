import assert from 'node:assert/strict';
import {afterEach, describe, it} from 'node:test';
import {container, dbConnect} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from '../../../../unit/Back/Dem/Compile/FakeAdapter.mjs';

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
    await connection?.disconnect();
    connection = undefined;
});

function primary() {
    return {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'};
}

function integer() {
    return {type: {id: 'core.integer', params: {bits: 32, unsigned: false}}};
}

function declaration(withChild = false) {
    const entity = {parent: {attr: {id: integer()}, index: {pk: primary()}, relation: {}}};
    if (withChild) {
        entity.child = {
            attr: {id: integer(), parent_id: integer()},
            index: {pk: primary()},
            relation: {
                parent: {
                    action: {}, attrs: ['parent_id'], deferrable: 'notDeferrable',
                    ref: {attrs: ['id'], path: '/parent'},
                },
            },
        };
    }
    return {version: 2, requires: [], package: {}, refs: {}, entity};
}

async function compilation({adapter = sqlite, deprecated = {}, withChild = false} = {}) {
    return compile.exec({
        adapter,
        fragments: [{
            declaration: declaration(withChild), filename: '/fixtures/schema.json', fragmentId: 'app', packageName: 'app',
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'teq', deprecated},
            filename: '/fixtures/map.json', mapId: 'map', packageName: 'app',
        },
    });
}

describe('schema plan and execution hardening', () => {
    it('rejects a frozen DTO-shaped forged plan before touching adapter or connection', async () => {
        let touched = false;
        const adapter = new Proxy({}, {get: () => {
            touched = true;
            return undefined;
        }});
        await assert.rejects(
            execute.exec({adapter, connection: {}, plan: Object.freeze({fingerprint: 'forged', phases: {}})}),
            /authentic schema plan/,
        );
        assert.equal(touched, false);
    });

    it('binds an authentic plan to its compilation adapter before preflight', async () => {
        const result = await compilation({adapter: createFakeAdapter()});
        const plan = planner.exec({compilation: result, operation: 'create'});
        let preflight = 0;
        const mismatched = Object.freeze({...sqlite, preflight: async () => {
            preflight++;
            return {diagnostics: []};
        }});
        await assert.rejects(
            execute.exec({adapter: mismatched, connection: {}, plan}),
            /does not match execution adapter/,
        );
        assert.equal(preflight, 0);
    });

    it('combines active and deprecated dependencies into deterministic reverse drop order', async () => {
        const result = await compilation({
            deprecated: {
                '/old_child': ['/old_parent'],
                '/old_parent': ['/parent'],
            },
            withChild: true,
        });
        const plan = planner.exec({compilation: result, operation: 'drop'});
        assert.deepEqual(plan.phases.tables.map((item) => item.entity), [
            '/old_child', '/schema/application', '/old_parent', '/child', '/schema/snapshot', '/parent',
        ]);
        assert.deepEqual(plan.phases.verification.map((item) => item.kind), [
            'tableAbsent', 'tableAbsent', 'tableAbsent', 'tableAbsent', 'tableAbsent', 'tableAbsent',
        ]);
    });

    it('fails deprecated dependency cycles and unknown endpoints before DDL', async () => {
        for (const [deprecated, code] of [
            [{'/old_a': ['/old_b'], '/old_b': ['/old_a']}, 'DEM_DEPENDENCY_CYCLE_UNPLANNED'],
            [{'/old_a': ['/missing']}, 'DEM_REFERENCE_ENTITY_MISSING'],
        ]) {
            const result = await compilation({deprecated});
            assert.throws(
                () => planner.exec({compilation: result, operation: 'drop'}),
                (error) => error.name === 'DemPlanError' && error.diagnostics[0].code === code,
            );
        }
    });

    it('executes and records table verification after create and drop', async () => {
        connection = await dbConnect();
        const result = await compilation();
        const create = await execute.exec({
            adapter: sqlite, connection, plan: planner.exec({compilation: result, operation: 'create'}),
        });
        assert.deepEqual(create.phases.at(-1), {
            evidence: {actual: true, expected: true, kind: 'tableExists', name: 'teq_schema_application'},
            identity: 'teq_schema_application', phase: 'verification', status: 'complete',
        });

        const drop = await execute.exec({
            adapter: sqlite, connection, plan: planner.exec({compilation: result, operation: 'drop'}),
        });
        assert.deepEqual(drop.phases.at(-1), {
            evidence: {actual: false, expected: false, kind: 'tableAbsent', name: 'teq_parent'},
            identity: 'teq_parent', phase: 'verification', status: 'complete',
        });
    });
});
