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
                    revision: mapEnvelope.revision,
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
            checkObject(raw, ['deprecated', 'identityProfile', 'namespace', 'ref', 'version'], '');
            if (raw.version !== 2) {
                const evidence = makeSource('/version');
                addDiagnostic({
                    code: 'DEM_DECLARATION_VERSION_UNSUPPORTED',
                    details: {input: 'map', version: raw.version},
                    message: 'Map version must be integer 2.',
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
            const profile = raw.identityProfile === undefined ? {
                generation: {kind: 'core.identity', params: {mode: 'byDefault'}},
                type: {id: 'core.integer', params: {bits: 32, unsigned: false}},
            } : raw.identityProfile;
            if (raw.identityProfile !== undefined && isObject(profile)) {
                checkObject(profile, ['generation', 'type'], '/identityProfile');
                if (isObject(profile.type)) {
                    checkObject(profile.type, ['id', 'params'], '/identityProfile/type');
                    if (profile.type.params !== undefined && !isObject(profile.type.params)) checkObject(profile.type.params, [], '/identityProfile/type/params');
                }
                if (isObject(profile.generation)) {
                    checkObject(profile.generation, ['kind', 'params'], '/identityProfile/generation');
                    if (profile.generation.params !== undefined && !isObject(profile.generation.params)) checkObject(profile.generation.params, [], '/identityProfile/generation/params');
                }
            }
            if (!isObject(profile) || !isObject(profile.type) || !isObject(profile.generation)) {
                const evidence = makeSource('/identityProfile');
                addDiagnostic({code: 'DEM_DECLARATION_SHAPE_INVALID', details: {field: 'identityProfile', input: 'map'}, message: 'Identity profile requires type and generation objects.', path: '/identityProfile', sources: evidence ? [evidence] : []});
            }
            const entities = {};
            /**
             * @param {object} container
             */
            const collectEntities = function (container) {
                for (const entity of Object.values(container.entity ?? {})) entities[entity.path] = entity;
                for (const child of Object.values(container.package ?? {})) collectEntities(child);
            };
            collectEntities(model);
            /**
             * @param {object} container
             * @param {string} pointer
             */
            const resolveIdentities = function (container, pointer) {
                for (const [entityName, entity] of Object.entries(container.entity ?? {})) {
                    const entityPointer = `${pointer}/entity/${escapePointer(entityName)}`;
                    for (const [attrName, attr] of Object.entries(entity.attr ?? {})) {
                        if (attr.type?.id !== 'core.identity') continue;
                        const attrPointer = `${entityPointer}/attr/${escapePointer(attrName)}`;
                        if (!isObject(profile) || !isObject(profile.type) || !isObject(profile.generation)) continue;
                        if (Object.keys(attr.type.params ?? {}).length > 0) {
                            addDiagnostic({code: 'DEM_TYPE_PARAMS_INVALID', details: {type: 'core.identity'}, message: 'core.identity does not accept type parameters.', path: attrPointer + '/type/params', sources: provenance[attrPointer] ?? [], stage: 'logical'});
                            continue;
                        }
                        attr.type = structuredClone(profile.type);
                        attr.generation = structuredClone(profile.generation);
                        attr.__demSpecial = 'identity';
                        const generationSource = raw.identityProfile === undefined
                            ? provenance[attrPointer] ?? []
                            : [makeSource('/identityProfile/generation')].filter(Boolean);
                        provenance[`${attrPointer}/generation`] = generationSource;
                        const primaryName = '__identity_primary';
                        if (entity.index?.[primaryName]) {
                            addDiagnostic({code: 'DEM_INDEX_INVALID', details: {index: primaryName}, message: 'Identity primary-key descriptor collides with a declared index.', path: attrPointer, sources: provenance[attrPointer] ?? [], stage: 'logical'});
                        } else {
                            entity.index ??= {};
                            entity.index[primaryName] = {include: [], keys: [{attr: attrName}], kind: 'primary', name: primaryName, options: {}, phase: 'table'};
                            provenance[`${entityPointer}/index/${primaryName}`] = [...(provenance[attrPointer] ?? [])];
                        }
                    }
                }
                for (const [name, child] of Object.entries(container.package ?? {})) resolveIdentities(child, `${pointer}/package/${escapePointer(name)}`);
            };
            resolveIdentities(model, '');
            /**
             * @param {object} container
             * @param {string} pointer
             */
            const resolveReferences = function (container, pointer) {
                for (const [entityName, entity] of Object.entries(container.entity ?? {})) {
                    const entityPointer = `${pointer}/entity/${escapePointer(entityName)}`;
                    for (const [attrName, attr] of Object.entries(entity.attr ?? {})) {
                        if (attr.type?.id !== 'core.ref') continue;
                        const attrPointer = `${entityPointer}/attr/${escapePointer(attrName)}`;
                        const matches = Object.values(entity.relation ?? {}).filter((relation) => relation.attrs?.filter((item) => item === attrName).length === 1);
                        if (matches.length !== 1) {
                            addDiagnostic({code: 'DEM_RELATION_CARDINALITY', details: {attribute: attrName, relations: matches.length}, message: 'A core.ref attribute must belong to exactly one relation.', path: attrPointer, sources: provenance[attrPointer] ?? [], stage: 'logical'});
                            continue;
                        }
                        const relation = matches[0];
                        const offset = relation.attrs.indexOf(attrName);
                        const target = entities[relation.ref.path]?.attr?.[relation.ref.attrs?.[offset]];
                        if (Object.keys(attr.type.params ?? {}).length > 0) {
                            addDiagnostic({code: 'DEM_TYPE_PARAMS_INVALID', details: {type: 'core.ref'}, message: 'core.ref does not accept type parameters.', path: attrPointer + '/type/params', sources: provenance[attrPointer] ?? [], stage: 'logical'});
                            continue;
                        }
                        if (!target?.type || target.__demSpecial !== 'identity') {
                            addDiagnostic({code: 'DEM_REF_TARGET_NOT_IDENTITY', details: {attribute: attrName}, message: 'core.ref must resolve to core.identity.', path: attrPointer, sources: provenance[attrPointer] ?? [], stage: 'logical'});
                            continue;
                        }
                        attr.type = structuredClone(target.type);
                        attr.__demSpecial = 'ref';
                    }
                }
                for (const [name, child] of Object.entries(container.package ?? {})) resolveReferences(child, `${pointer}/package/${escapePointer(name)}`);
            };
            resolveReferences(model, '');
            /**
             * @param {object} container
             */
            const clearSpecialMarkers = function (container) {
                for (const entity of Object.values(container.entity ?? {})) {
                    for (const attr of Object.values(entity.attr ?? {})) delete attr.__demSpecial;
                }
                for (const child of Object.values(container.package ?? {})) clearSpecialMarkers(child);
            };
            clearSpecialMarkers(model);
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
