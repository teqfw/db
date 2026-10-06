import {container} from '../TestEnv.mjs';
import {platformFragment} from './Dem.mjs';

export const compiler = await container.get('TeqFw_Db_Back_Dem_Compile$');
export const identity = await container.get('TeqFw_Db_Back_RDb_Identity$');
export const planner = await container.get('TeqFw_Db_Back_RDb_Schema_A_Plan$');
export const builder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder$');

export async function identityCompilation(adapter, {namespace = 'allocated', mode = 'allocated', bits = 64, self = false, platform = true} = {}) {
    const person = {attr: {id: {type: {id: 'core.identity'}}}, relation: {}, index: {}};
    if (self) {
        person.attr.parent_ref = {type: {id: 'core.ref'}};
        person.relation.parent = {attrs: ['parent_ref'], ref: {path: '/person', attrs: ['id']}};
    }
    return compiler.exec({
        adapter,
        fragments: [
            ...(platform ? [platformFragment()] : []),
            {declaration: {version: 2, namespace: 'sample.people', entity: {person}}, filename: '/people/schema.json', fragmentId: 'people', packageName: 'people'},
            {declaration: {version: 2, namespace: 'sample.auth', refs: {'/owner': ['id']}, entity: {email: {
                attr: {id: {type: {id: 'core.identity'}}, person_ref: {type: {id: 'core.ref'}}},
                relation: {person: {attrs: ['person_ref'], ref: {path: '/owner', attrs: ['id']}}},
            }}}, filename: '/auth/schema.json', fragmentId: 'auth', packageName: 'auth'},
        ],
        mapEnvelope: {declaration: {version: 2, namespace,
            identityProfile: {type: {id: 'core.integer', params: {bits, unsigned: false}}, generation: {kind: 'core.identity', params: {mode}}},
            ref: {auth: {'/owner': {path: '/sample/people/person'}}},
        }, filename: '/app/map.json', mapId: 'app:map', packageName: 'app'},
    });
}

export function tableFor(compilation, entity) {
    return compilation.physical.tables.find((table) => table.entity === entity).name;
}

export async function createIdentitySchema(connection, compilation) {
    await builder.exec({adapter: connection.getDialectAdapter(), connection, plan: planner.exec({compilation, operation: 'create'})});
}

export const personEntity = '/sample/people/person';
export const emailEntity = '/sample/auth/email';
export const counterEntity = '/teqfw/db/schema/identitycounter';
