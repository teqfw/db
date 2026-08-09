import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../TestEnv.mjs';

const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
const rebuild = await container.get('TeqFw_Db_Back_RDb_Rebuild$');
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');

const integer = () => ({type: {id: 'core.integer', params: {bits: 32, unsigned: false}}});
const primary = () => ({include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'});

async function cyclicCompilation() {
    const relation = (attr, path) => ({
        action: {}, attrs: [attr], deferrable: 'notDeferrable', ref: {attrs: ['id'], path},
    });
    return compile.exec({
        adapter,
        fragments: [{
            declaration: {
                version: 2, requires: [], package: {}, refs: {},
                entity: {
                    a: {
                        attr: {b_id: integer(), id: integer()}, index: {pk: primary()},
                        relation: {b: relation('b_id', '/b')},
                    },
                    b: {
                        attr: {a_id: integer(), id: integer()}, index: {pk: primary()},
                        relation: {a: relation('a_id', '/a')},
                    },
                },
            },
            filename: '/fixtures/cycle/schema.json', fragmentId: 'cycle', packageName: 'cycle',
        }],
        mapEnvelope: {
            declaration: {version: 2, namespace: 'cycle'}, filename: '/fixtures/cycle/map.json',
            mapId: 'cycle:map', packageName: 'cycle',
        },
    });
}

describe('rebuild cycle boundary', () => {
    it('rejects an unsupported transfer cycle before source reads or target writes', async () => {
        const compilation = await cyclicCompilation();
        let sourceReads = 0;
        let targetWrites = 0;
        const source = {
            getDialectAdapter: () => adapter,
            getKnex: () => {
                sourceReads++;
                throw new Error('source must not be read');
            },
        };
        const target = {
            getDialectAdapter: () => adapter,
            startTransaction: async () => {
                targetWrites++;
                throw new Error('target must not be mutated');
            },
        };

        await assert.rejects(rebuild.exec({
            compilation,
            mode: 'parallel',
            source,
            sourceId: 'cycle-source',
            target,
            targetId: 'cycle-target',
        }), (error) => {
            assert.equal(error.name, 'DemPlanError');
            assert.deepEqual(error.diagnostics.map((item) => item.code), ['DEM_DEPENDENCY_CYCLE_UNPLANNED']);
            return true;
        });
        assert.equal(sourceReads, 0);
        assert.equal(targetWrites, 0);
    });
});
