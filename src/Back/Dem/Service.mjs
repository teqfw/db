// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Service
 * @description Supplies the package-owned DEM used to retain effective-model history.
 */

/**
 * Provides immutable declaration input for the schema-history service entities.
 */
export default class TeqFw_Db_Back_Dem_Service {
    /** Initialize the package-owned history declaration. */
    constructor() {
        /** @returns {object} */
        const primary = () => ({include: [], keys: [{attr: 'id'}], kind: 'primary', options: {}, phase: 'table'});
        /** @returns {object} */
        const unique = () => ({include: [], keys: [{attr: 'fingerprint'}], kind: 'unique', options: {}, phase: 'table'});
        /** @param {'source'|'target'} path @returns {object} */
        const reference = (path) => ({
            action: {delete: 'restrict', update: 'cascade'}, attrs: [path === 'source' ? 'source_snapshot_id' : 'target_snapshot_id'],
            deferrable: 'notDeferrable', ref: {attrs: ['id'], path: '/schema/snapshot'},
        });
        const declaration = {
            version: 2,
            requires: [],
            refs: {},
            package: {
                schema: {
                    entity: {
                        snapshot: {
                            attr: {
                                created_at: {default: {kind: 'function', name: 'core.currentTimestamp', params: {}}, type: {id: 'core.datetime', params: {}}},
                                dem: {type: {id: 'core.text', params: {}}},
                                fingerprint: {type: {id: 'core.string', params: {length: 96}}},
                                id: {type: {id: 'core.identity', params: {}}},
                                provenance: {type: {id: 'core.text', params: {}}},
                            },
                            index: {fingerprint: unique()},
                            relation: {},
                        },
                        application: {
                            attr: {
                                completed_at: {nullable: true, type: {id: 'core.datetime', params: {}}},
                                id: {type: {id: 'core.identity', params: {}}},
                                source_snapshot_id: {nullable: true, type: {id: 'core.ref', params: {}}},
                                started_at: {default: {kind: 'function', name: 'core.currentTimestamp', params: {}}, type: {id: 'core.datetime', params: {}}},
                                status: {type: {id: 'core.enum', params: {values: ['started', 'applied', 'failed']}}},
                                target_snapshot_id: {type: {id: 'core.ref', params: {}}},
                            },
                            index: {},
                            relation: {source: reference('source'), target: reference('target')},
                        },
                    },
                    package: {},
                },
            },
            entity: {},
        };
        const envelope = Object.freeze({
            declaration: Object.freeze(declaration),
            filename: '@teqfw/db/service/schema-history',
            fragmentId: '@teqfw/db:service-schema-history',
            packageName: '@teqfw/db',
        });

        /** @returns {Readonly<object>} */
        this.getFragment = function () {
            return envelope;
        };
        Object.freeze(this);
    }
}
