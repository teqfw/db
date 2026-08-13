import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from '../../Dem/Compile/FakeAdapter.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Plan} */
const plan = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const sqlite = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

function primary() {
    return {include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'};
}

function fragment(declaration) {
    return {declaration, filename: '/fixtures/app/schema.json', fragmentId: 'app', packageName: 'app'};
}

function mapEnvelope() {
    return {declaration: {version: 2, namespace: 'teq'}, filename: '/fixtures/app/map.json', mapId: 'map', packageName: 'app'};
}

async function compileModel(declaration, adapter = createFakeAdapter()) {
    return compile.exec({adapter, fragments: [fragment(declaration)], mapEnvelope: mapEnvelope()});
}

describe('TeqFw_Db_Back_RDb_Schema_A_Plan', () => {
    it('orders tables before relations and preserves every declared index phase', async () => {
        const compilation = await compileModel({
            version: 2, requires: [], package: {}, refs: {},
            entity: {
                parent: {
                    attr: {id: {type: {id: 'core.integer', params: {}}}},
                    index: {pk: primary()}, relation: {},
                },
                child: {
                    attr: {
                        id: {type: {id: 'core.integer', params: {}}},
                        parent_id: {type: {id: 'core.integer', params: {}}},
                    },
                    index: {
                        pk: primary(),
                        late: {
                            include: [], keys: [{attr: 'parent_id'}], kind: 'index', method: 'core.btree',
                            options: {}, phase: 'afterData',
                        },
                    },
                    relation: {
                        parent: {
                            action: {}, attrs: ['parent_id'], deferrable: 'notDeferrable',
                            ref: {attrs: ['id'], path: '/parent'},
                        },
                    },
                },
            },
        });
        const value = plan.exec({compilation, operation: 'create'});
        assert.deepEqual(value.phases.tables.map((item) => item.table.entity), ['/parent', '/child']);
        assert.equal(value.phases.relations.length, 1);
        assert.equal(value.phases.afterData.length, 1);
        assert.equal(value.phases.afterData[0].phase, 'afterData');
        assert(Object.isFrozen(value));
        assert(Object.isFrozen(value.phases.tables));
    });

    it('allows cyclic schema planning but rejects cyclic transfer before any data operation', async () => {
        const relation = (path) => ({
            action: {}, attrs: ['other_id'], deferrable: 'notDeferrable', ref: {attrs: ['id'], path},
        });
        const entity = (path) => ({
            attr: {
                id: {type: {id: 'core.integer', params: {}}},
                other_id: {type: {id: 'core.integer', params: {}}},
            },
            index: {pk: primary()}, relation: {other: relation(path)},
        });
        const compilation = await compileModel({
            version: 2, requires: [], package: {}, refs: {},
            entity: {alpha: entity('/beta'), beta: entity('/alpha')},
        }, sqlite);
        const schema = plan.exec({compilation, operation: 'create'});
        assert.equal(schema.phases.tables.length, 2);
        assert.equal(schema.phases.relations.length, 2);
        assert.throws(
            () => plan.exec({compilation, operation: 'transfer', includeData: true}),
            (error) => error.name === 'DemPlanError'
                && error.diagnostics[0].code === 'DEM_DEPENDENCY_CYCLE_UNPLANNED',
        );
    });

    it('rejects an unbranded DTO-shaped input', () => {
        assert.throws(() => plan.exec({compilation: {physical: {}, graph: {}}, operation: 'create'}), /successful DEM compilation result/);
    });
});
