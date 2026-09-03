import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../../TestEnv.mjs';
import {createFakeAdapter} from '../../../../../data/Dem/FakeAdapter.mjs';
import {platformFragment} from '../../../../../data/Dem.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');

function fragment(declaration) {
    return {
        declaration,
        filename: '/fixtures/graph/etc/teqfw.schema.json',
        fragmentId: 'graph',
        packageName: 'graph',
    };
}

function mapEnvelope() {
    return {
        declaration: {version: 2, namespace: 'teq'},
        filename: '/fixtures/graph/etc/teqfw.schema.map.json',
        mapId: 'graph-map',
        packageName: 'graph',
    };
}

function entity(relations = {}) {
    const attr = {id: {type: {id: 'core.integer', params: {}}}};
    for (const name of Object.keys(relations)) attr[`${name}_id`] = {type: {id: 'core.integer', params: {}}};
    const relation = {};
    for (const [name, target] of Object.entries(relations)) {
        relation[name] = {
            attrs: [`${name}_id`],
            ref: {path: `/${target}`, attrs: ['id']},
            action: {},
            deferrable: target === name ? 'deferred' : 'notDeferrable',
        };
    }
    return {
        attr,
        index: {pk: {kind: 'primary', keys: [{attr: 'id'}], include: [], options: {}, phase: 'table'}},
        relation,
    };
}

async function compile(entityMap, includePlatform = false) {
    return compiler.exec({
        adapter: createFakeAdapter(),
        fragments: [
            ...(includePlatform ? [platformFragment()] : []),
            fragment({version: 2, requires: [], entity: entityMap, package: {}, refs: {}}),
        ],
        mapEnvelope: mapEnvelope(),
    });
}

describe('TeqFw_Db_Back_Dem_Compile_A_Graph', () => {
    it('does not inject package-owned history nodes into an otherwise empty application graph', async () => {
        const result = await compile({});
        assert.deepEqual(result.graph.entities, []);
        assert.deepEqual(result.graph.edges, []);
        assert.deepEqual(result.graph.topological, []);
        assert.deepEqual(result.graph.cycles, []);
    });

    it('composes package-owned history nodes from an ordinary fragment', async () => {
        const result = await compile({}, true);
        assert.deepEqual(result.graph.entities, ['/teqfw/db/schema/application', '/teqfw/db/schema/snapshot']);
        assert.deepEqual(result.graph.edges.map((item) => [item.from, item.to]), [
            ['/teqfw/db/schema/application', '/teqfw/db/schema/snapshot'],
            ['/teqfw/db/schema/application', '/teqfw/db/schema/snapshot'],
        ]);
        assert.deepEqual(result.graph.topological, ['/teqfw/db/schema/snapshot', '/teqfw/db/schema/application']);
        assert.equal(result.provenance['/package/teqfw/package/db/package/schema/entity/snapshot'][0].fragmentId, '@teqfw/db');
    });

    it('orders a DAG dependency-first and retains relation provenance', async () => {
        const result = await compile({child: entity({parent: 'parent'}), parent: entity()});

        assert.deepEqual(result.graph.topological, ['/parent', '/child']);
        assert.deepEqual(result.graph.edges.filter((item) => item.from === '/child').map((item) => [item.from, item.to, item.relation]), [
            ['/child', '/parent', 'parent'],
        ]);
        assert.equal(result.graph.edges.find((item) => item.from === '/child').sources[0].sourcePointer, '/entity/child/relation/parent');
        assert.deepEqual(result.graph.cycles, []);
    });

    it('records a self-reference as a cycle instead of flattening it away', async () => {
        const result = await compile({node: entity({node: 'node'})});

        assert.deepEqual(result.graph.cycles.map((item) => item.entities), [['/node']]);
        assert.equal(result.graph.cycles[0].relations[0].from, '/node');
        assert.equal(result.graph.cycles[0].relations[0].to, '/node');
    });

    it('returns deterministic independent SCCs and condensation order', async () => {
        const first = await compile({
            a: entity({b: 'b', root: 'root'}),
            b: entity({a: 'a'}),
            c: entity({d: 'd'}),
            d: entity({c: 'c'}),
            leaf: entity({a: 'a'}),
            root: entity(),
        });
        const second = await compile({
            root: entity(),
            leaf: entity({a: 'a'}),
            d: entity({c: 'c'}),
            c: entity({d: 'd'}),
            b: entity({a: 'a'}),
            a: entity({root: 'root', b: 'b'}),
        });

        assert.deepEqual(first.graph, second.graph);
        assert.deepEqual(first.graph.cycles.map((item) => item.entities), [
            ['/a', '/b'],
            ['/c', '/d'],
        ]);
        assert.ok(first.graph.topological.indexOf('/root') < first.graph.topological.indexOf('/a'));
        assert.ok(first.graph.topological.indexOf('/a') < first.graph.topological.indexOf('/leaf'));
    });
});
