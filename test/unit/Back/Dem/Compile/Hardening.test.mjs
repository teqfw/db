import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {container} from '../../../../TestEnv.mjs';
import {createFakeAdapter} from './FakeAdapter.mjs';

/** @type {TeqFw_Db_Back_Dem_Compile} */
const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');

function fragment(declaration, fragmentId = 'app') {
    return {
        declaration,
        filename: `/fixtures/${fragmentId}/etc/teqfw.schema.json`,
        fragmentId,
        packageName: fragmentId,
    };
}

function mapEnvelope(declaration = {version: 2, namespace: 'teq'}) {
    return {
        declaration,
        filename: '/fixtures/app/etc/teqfw.schema.map.json',
        mapId: 'app:map',
        packageName: 'app',
    };
}

function integer() {
    return {type: {id: 'core.integer', params: {bits: 32, unsigned: false}}};
}

function primary(attr = 'id') {
    return {include: [], keys: [{attr}], kind: 'primary', options: {}, phase: 'table'};
}

function entity(name = 'item') {
    return {
        version: 2,
        requires: [],
        package: {},
        refs: {},
        entity: {[name]: {attr: {id: integer()}, index: {pk: primary()}, relation: {}}},
    };
}

describe('DEM compiler hardening boundaries', () => {
    it('rejects an invalid entity identifier before canonicalization and retains its source', async () => {
        const declaration = entity('User');

        await assert.rejects(
            compiler.exec({adapter: createFakeAdapter(), fragments: [fragment(declaration)], mapEnvelope: mapEnvelope()}),
            (error) => {
                const item = error.diagnostics.find((value) => value.code === 'DEM_DECLARATION_IDENTIFIER_INVALID');
                assert(item);
                assert.deepEqual(item.details, {kind: 'entity', name: 'User', pattern: '^[a-z][a-z0-9]*$'});
                assert.deepEqual(item.sources.map((value) => value.sourcePointer), ['/entity/User']);
                assert.equal('model' in error, false);
                return true;
            },
        );
    });

    it('rejects normalized map reference and attribute collisions before mapping', async () => {
        const map = mapEnvelope({
            version: 2,
            namespace: 'teq',
            deprecated: {},
            ref: {
                app: {
                    '/Alias/User': {path: '/item', attrs: {ExternalId: 'id', ' externalid ': 'id'}},
                    '/External/User': {path: '/item', attrs: {external_id: 'id'}},
                    '/ external/user ': {path: '/item', attrs: {external_id: 'id'}},
                },
            },
        });

        await assert.rejects(
            compiler.exec({adapter: createFakeAdapter(), fragments: [fragment(entity())], mapEnvelope: map}),
            (error) => {
                const collisions = error.diagnostics.filter((value) => value.code === 'DEM_COMPOSITION_OWNER_CONFLICT');
                assert.equal(collisions.length, 2);
                assert(collisions.every((value) => value.sources.length === 2));
                return true;
            },
        );
    });

    it('retains declaration provenance for adapter-derived capabilities', async () => {
        const base = createFakeAdapter({supportedCapabilities: ['test.core', 'test.storage.integer']});
        const adapter = Object.freeze({
            ...base,
            describe: async () => ({
                id: 'test', clients: ['test'], registryVersions: {core: 1},
                supportedCapabilities: ['test.core', 'test.storage.integer'],
            }),
            resolveType: async (args) => ({
                ...await base.resolveType(args),
                requirements: ['test.storage.integer'],
            }),
        });
        const result = await compiler.exec({adapter, fragments: [fragment(entity())], mapEnvelope: mapEnvelope()});

        assert.deepEqual(result.requirements, ['test.storage.integer']);
        assert.deepEqual(
            result.provenance['/requires/test.storage.integer'].filter((value) => value.packageName !== '@teqfw/db').map((value) => value.sourcePointer),
            ['/entity/item/attr/id'],
        );
    });

    it('rejects an adapter missing relation projection before producing a physical plan', async () => {
        const {resolveRelation, ...incomplete} = createFakeAdapter();
        assert.equal(typeof resolveRelation, 'function');

        await assert.rejects(
            compiler.exec({adapter: Object.freeze(incomplete), fragments: [fragment(entity())], mapEnvelope: mapEnvelope()}),
            (error) => {
                const item = error.diagnostics.find((value) => value.code === 'DEM_CAPABILITY_UNSUPPORTED');
                assert.deepEqual(item.details.adapterMethods, ['resolveRelation']);
                assert.equal('physical' in error, false);
                return true;
            },
        );
    });

    it('rejects key-constraint modifiers and INCLUDE overlap with expression key attributes', async () => {
        const declaration = entity();
        declaration.entity.item.attr.name = {type: {id: 'core.string', params: {length: 32}}};
        declaration.entity.item.index.pk.keys[0].order = 'asc';
        declaration.entity.item.index.pk.include = ['name'];
        declaration.entity.item.index.pk.options = {unsafe: true};
        declaration.entity.item.index.expression = {
            include: ['name'],
            keys: [{expression: {kind: 'attr', name: 'name'}}],
            kind: 'index',
            method: 'core.btree',
            options: {},
            phase: 'afterRelations',
        };

        await assert.rejects(
            compiler.exec({adapter: createFakeAdapter(), fragments: [fragment(declaration)], mapEnvelope: mapEnvelope()}),
            (error) => {
                const paths = error.diagnostics.filter((value) => value.code === 'DEM_INDEX_INVALID')
                    .map((value) => value.path);
                assert(paths.includes('/entity/item/index/pk'));
                assert(paths.includes('/entity/item/index/expression'));
                return true;
            },
        );
    });

    it('rejects a physical table/index name collision after namespace conversion', async () => {
        const declaration = entity('alpha');
        declaration.entity.alpha.index.beta = {
            include: [], keys: [{attr: 'id'}], kind: 'index', method: 'core.btree', options: {}, phase: 'afterRelations',
        };
        declaration.package.alpha = {
            entity: {beta: {attr: {id: integer()}, index: {pk: primary()}, relation: {}}}, package: {},
        };
        const base = createFakeAdapter();
        const adapter = Object.freeze({
            ...base,
            resolveIndex: async ({index, physicalName}) => ({
                descriptor: {
                    include: [...index.include], keys: structuredClone(index.keys), kind: index.kind,
                    method: index.method, name: physicalName, options: structuredClone(index.options),
                },
                diagnostics: [], requirements: [],
            }),
        });

        await assert.rejects(
            compiler.exec({adapter, fragments: [fragment(declaration)], mapEnvelope: mapEnvelope()}),
            (error) => {
                const item = error.diagnostics.find((value) => value.code === 'DEM_PHYSICAL_NAME_COLLISION');
                assert(item);
                assert.equal(item.details.name, 'teq_alpha_beta');
                return true;
            },
        );
    });
});
