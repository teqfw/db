// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_MapRefs
 * @description Resolves owner-scoped external references through a trusted application map.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_MapRefs {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic.Factory} deps.diagnostic
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Source.Factory} deps.source
     */
    constructor({diagnostic, source}) {
        /**
         * @param {string} value
         * @returns {string}
         */
        const escapePointer = function (value) {
            return value.replaceAll('~', '~0').replaceAll('/', '~1');
        };

        /**
         * @param {any} value
         * @returns {boolean}
         */
        const isObject = function (value) {
            return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
        };

        /**
         * @param {string} value
         * @returns {string}
         */
        const normalizeName = function (value) {
            return value.toLowerCase().trim();
        };

        /**
         * @param {string} value
         * @returns {string}
         */
        const normalizePath = function (value) {
            return `/${value.split('/').map(normalizeName).filter(Boolean).join('/')}`;
        };

        /**
         * @param {object} deps
         * @param {object} deps.composed
         * @param {object} deps.mapEnvelope
         * @returns {object}
         */
        this.exec = function ({composed, mapEnvelope}) {
            const diagnostics = [...composed.diagnostics];
            const model = composed.model;
            const provenance = composed.provenance;
            const raw = isObject(mapEnvelope?.declaration) ? mapEnvelope.declaration : {};
            const mapId = mapEnvelope?.mapId ?? mapEnvelope?.fragmentId;
            const trusted = typeof mapId === 'string' && mapId.length > 0
                && typeof mapEnvelope?.packageName === 'string' && mapEnvelope.packageName.length > 0
                && typeof mapEnvelope?.filename === 'string' && mapEnvelope.filename.length > 0;

            /**
             * @param {string} sourcePointer
             * @returns {object|null}
             */
            const makeSource = function (sourcePointer) {
                if (!trusted) return null;
                return source.create({
                    filename: mapEnvelope.filename,
                    fragmentId: mapId,
                    packageName: mapEnvelope.packageName,
                    sourcePointer,
                });
            };

            /**
             * @param {object} deps
             * @param {string} deps.code
             * @param {object} deps.details
             * @param {string} deps.message
             * @param {string} deps.path
             * @param {ReadonlyArray<object>} deps.sources
             * @param {string} deps.stage
             */
            const addDiagnostic = function ({code, details = {}, message, path, sources = [], stage = 'decode'}) {
                diagnostics.push(diagnostic.create({code, details, message, path, sources, stage}));
            };

            /**
             * @param {any} value
             * @param {ReadonlyArray<string>} allowed
             * @param {string} path
             * @returns {boolean}
             */
            const checkObject = function (value, allowed, path) {
                if (!isObject(value)) {
                    const evidence = makeSource(path);
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {expected: 'object', input: 'map'},
                        message: 'Map declaration node must be an object.',
                        path,
                        sources: evidence ? [evidence] : [],
                    });
                    return false;
                }
                for (const key of Object.keys(value)) {
                    if (!allowed.includes(key)) {
                        const pointer = `${path}/${escapePointer(key)}`;
                        const evidence = makeSource(pointer);
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {field: key, input: 'map'},
                            message: 'Map declaration contains an unknown field.',
                            path: pointer,
                            sources: evidence ? [evidence] : [],
                        });
                    }
                }
                return true;
            };

            if (mapEnvelope !== undefined && mapEnvelope !== null && !trusted) {
                addDiagnostic({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {field: 'mapEnvelope'},
                    message: 'A trusted map envelope requires mapId, packageName, and filename.',
                    path: '',
                    sources: [],
                    stage: 'parse',
                });
            }
            checkObject(raw, ['deprecated', 'namespace', 'ref', 'version'], '');
            if (raw.version !== undefined && raw.version !== 2) {
                const evidence = makeSource('/version');
                addDiagnostic({
                    code: 'DEM_DECLARATION_VERSION_UNSUPPORTED',
                    details: {input: 'map', version: raw.version},
                    message: 'Map version must be unversioned compatibility input or integer 2.',
                    path: '/version',
                    sources: evidence ? [evidence] : [],
                });
            }
            if (raw.namespace !== undefined && typeof raw.namespace !== 'string') {
                const evidence = makeSource('/namespace');
                addDiagnostic({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {field: 'namespace', input: 'map'},
                    message: 'Physical table namespace must be a string.',
                    path: '/namespace',
                    sources: evidence ? [evidence] : [],
                });
            }
            model.namespace = typeof raw.namespace === 'string' ? normalizeName(raw.namespace) : '';
            const mapRefs = {};
            if (raw.ref !== undefined && !isObject(raw.ref)) {
                checkObject(raw.ref, [], '/ref');
            } else if (isObject(raw.ref)) {
                for (const owner of Object.keys(raw.ref).sort()) {
                    const ownerValue = raw.ref[owner];
                    const ownerPointer = `/ref/${escapePointer(owner)}`;
                    if (!checkObject(ownerValue, Object.keys(ownerValue ?? {}), ownerPointer)) continue;
                    mapRefs[owner] = {};
                    for (const refPath of Object.keys(ownerValue).sort()) {
                        let entry = ownerValue[refPath];
                        const entryPointer = `${ownerPointer}/${escapePointer(refPath)}`;
                        if (!checkObject(entry, ['attrs', 'path'], entryPointer)) entry = {};
                        const attrs = {};
                        if (entry.attrs !== undefined && !isObject(entry.attrs)) {
                            checkObject(entry.attrs, [], `${entryPointer}/attrs`);
                        } else if (isObject(entry.attrs)) {
                            for (const [alias, actual] of Object.entries(entry.attrs)) {
                                if (typeof actual !== 'string') {
                                    const evidence = makeSource(`${entryPointer}/attrs/${escapePointer(alias)}`);
                                    addDiagnostic({
                                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                                        details: {field: 'attrs', input: 'map'},
                                        message: 'Mapped attribute name must be a string.',
                                        path: `${entryPointer}/attrs/${escapePointer(alias)}`,
                                        sources: evidence ? [evidence] : [],
                                    });
                                } else {
                                    attrs[normalizeName(alias)] = normalizeName(actual);
                                }
                            }
                        }
                        mapRefs[owner][normalizePath(refPath)] = {
                            attrs,
                            path: typeof entry.path === 'string' ? normalizePath(entry.path) : '',
                            sourcePointer: entryPointer,
                        };
                    }
                }
            }
            model.deprecated = {};
            if (raw.deprecated !== undefined && !isObject(raw.deprecated)) {
                checkObject(raw.deprecated, [], '/deprecated');
            } else if (isObject(raw.deprecated)) {
                for (const name of Object.keys(raw.deprecated).sort()) {
                    const values = raw.deprecated[name];
                    if (!Array.isArray(values) || !values.every((item) => typeof item === 'string')) {
                        const pointer = `/deprecated/${escapePointer(name)}`;
                        const evidence = makeSource(pointer);
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {expected: 'string[]', input: 'map'},
                            message: 'Deprecated entity dependencies must be a string array.',
                            path: pointer,
                            sources: evidence ? [evidence] : [],
                        });
                    } else {
                        model.deprecated[normalizePath(name)] = values.map(normalizePath).sort();
                    }
                }
            }

            /**
             * @param {object} container
             * @param {string} pointer
             */
            const walk = function (container, pointer) {
                for (const entityName of Object.keys(container.entity ?? {}).sort()) {
                    const entity = container.entity[entityName];
                    const entityPointer = `${pointer}/entity/${escapePointer(entityName)}`;
                    for (const relationName of Object.keys(entity.relation ?? {}).sort()) {
                        const relation = entity.relation[relationName];
                        const relationPointer = `${entityPointer}/relation/${escapePointer(relationName)}`;
                        const owner = composed.ownerByPath[relationPointer];
                        const declared = composed.externalRefs[owner]?.refs ?? {};
                        if (!Object.prototype.hasOwnProperty.call(declared, relation.ref.path)) continue;
                        const entry = mapRefs[owner]?.[relation.ref.path];
                        if (!entry || !entry.path) {
                            addDiagnostic({
                                code: 'DEM_REFERENCE_MAP_MISSING',
                                details: {owner, ref: relation.ref.path},
                                message: 'An external relation reference has no owner-scoped map entry.',
                                path: relationPointer,
                                sources: provenance[relationPointer] ?? [],
                                stage: 'composition',
                            });
                            continue;
                        }
                        relation.ref.path = entry.path;
                        relation.ref.attrs = relation.ref.attrs.map((name) => entry.attrs[name] ?? name);
                        const mapSource = makeSource(entry.sourcePointer);
                        if (mapSource) {
                            const values = provenance[relationPointer] ?? [];
                            provenance[relationPointer] = [...values, mapSource].sort((a, b) => {
                                const left = `${a.fragmentId}\u0000${a.filename}\u0000${a.sourcePointer}`;
                                const right = `${b.fragmentId}\u0000${b.filename}\u0000${b.sourcePointer}`;
                                return left.localeCompare(right);
                            });
                        }
                    }
                }
                for (const packageName of Object.keys(container.package ?? {}).sort()) {
                    walk(container.package[packageName], `${pointer}/package/${escapePointer(packageName)}`);
                }
            };
            walk(model, '');
            return {...composed, diagnostics, model, provenance};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        source: 'TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory$',
    }),
});
