// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_DecodeV2
 * @description Decodes and shape-checks explicit DEM v2 declarations.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_DecodeV2 {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory} deps.diagnostic
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory} deps.source
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

        const localIdentifier = /^[a-z][a-z0-9]*$/;

        /**
         * @param {any} value
         * @returns {any}
         */
        const copy = function (value) {
            if (Array.isArray(value)) return value.map(copy);
            if (isObject(value)) {
                const res = {};
                for (const key of Object.keys(value).sort()) res[key] = copy(value[key]);
                return res;
            }
            return value;
        };

        /**
         * @param {object} deps
         * @param {object} deps.envelope
         * @returns {any}
         */
        this.exec = function ({envelope}) {
            const diagnostics = [];
            const pointers = {};
            const trusted = envelope && typeof envelope === 'object'
                && typeof envelope.fragmentId === 'string' && envelope.fragmentId.length > 0
                && typeof envelope.packageName === 'string' && envelope.packageName.length > 0
                && typeof envelope.filename === 'string' && envelope.filename.length > 0;
            if (!trusted) {
                diagnostics.push(diagnostic.create({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {field: 'envelope'},
                    message: 'A trusted fragment envelope requires fragmentId, packageName, and filename.',
                    path: '',
                    sources: [],
                    stage: 'parse',
                }));
                return {declaration: null, diagnostics, envelope, pointers};
            }

            /**
             * @param {string} sourcePointer
             * @returns {any}
             */
            const makeSource = function (sourcePointer) {
                return source.create({
                    filename: envelope.filename,
                    fragmentId: envelope.fragmentId,
                    packageName: envelope.packageName,
                    revision: envelope.revision,
                    sourcePointer,
                });
            };

            /**
             * @param {object} deps
             * @param {string} deps.code
             * @param {object} deps.details
             * @param {string} deps.message
             * @param {string} deps.path
             * @param {object} deps.severity
             * @param {string} deps.stage
             */
            const addDiagnostic = function ({code, details = {}, message, path, severity = 'error', stage = 'decode'}) {
                diagnostics.push(diagnostic.create({
                    code,
                    details,
                    message,
                    path,
                    severity,
                    sources: [makeSource(path)],
                    stage,
                }));
            };

            /**
             * @param {any} value
             * @param {any} allowed
             * @param {string} path
             * @returns {boolean}
             */
            const checkObject = function (value, allowed, path) {
                if (!isObject(value)) {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {expected: 'object'},
                        message: 'Declaration node must be an object.',
                        path,
                    });
                    return false;
                }
                for (const key of Object.keys(value)) {
                    if (!allowed.includes(key)) {
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {field: key},
                            message: 'Declaration object contains an unknown field.',
                            path: `${path}/${escapePointer(key)}`,
                        });
                    }
                }
                return true;
            };

            /**
             * @param {string} canonicalPointer
             * @param {string} sourcePointer
             */
            const record = function (canonicalPointer, sourcePointer) {
                pointers[canonicalPointer] = sourcePointer;
            };

            /**
             * @param {any} raw
             * @param {string} path
             * @returns {any}
             */
            const decodeType = function (raw, path) {
                if (!checkObject(raw, ['id', 'params'], path)) raw = {};
                if (typeof raw.id !== 'string') {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {field: 'id'},
                        message: 'Logical type identity must be a string.',
                        path: `${path}/id`,
                    });
                }
                if (raw.params !== undefined && !isObject(raw.params)) checkObject(raw.params, [], `${path}/params`);
                return {id: typeof raw.id === 'string' ? raw.id : '', params: isObject(raw.params) ? copy(raw.params) : {}};
            };

            /**
             * @param {any} raw
             * @param {string} path
             * @returns {any}
             */
            const decodeExpression = function (raw, path) {
                if (!isObject(raw)) {
                    checkObject(raw, [], path);
                    return {kind: ''};
                }
                if (raw.kind === 'attr') {
                    checkObject(raw, ['kind', 'name'], path);
                    return {kind: 'attr', name: typeof raw.name === 'string' ? normalizeName(raw.name) : ''};
                }
                if (raw.kind === 'value') {
                    checkObject(raw, ['kind', 'type', 'value'], path);
                    const res = {kind: 'value', value: copy(raw.value)};
                    if (raw.type !== undefined) res.type = decodeType(raw.type, `${path}/type`);
                    return res;
                }
                if (raw.kind === 'call') {
                    checkObject(raw, ['args', 'kind', 'operator'], path);
                    const args = Array.isArray(raw.args) ? raw.args : [];
                    if (!Array.isArray(raw.args)) {
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {field: 'args'},
                            message: 'Expression call arguments must be an array.',
                            path: `${path}/args`,
                        });
                    }
                    return {
                        kind: 'call',
                        operator: typeof raw.operator === 'string' ? raw.operator : '',
                        args: args.map((item, index) => decodeExpression(item, `${path}/args/${index}`)),
                    };
                }
                checkObject(raw, ['kind'], path);
                addDiagnostic({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {kind: raw.kind},
                    message: 'Expression node kind is unknown.',
                    path: `${path}/kind`,
                });
                return {kind: typeof raw.kind === 'string' ? raw.kind : ''};
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} name
             * @returns {any}
             */
            const decodeAttr = function (raw, rawPointer, canonicalPointer, name) {
                if (!checkObject(raw, ['comment', 'default', 'generation', 'nullable', 'storage', 'type'], rawPointer)) raw = {};
                const res = {
                    name,
                    comment: typeof raw.comment === 'string' ? raw.comment : '',
                    type: decodeType(raw.type, rawPointer + '/type'),
                    storage: {},
                    nullable: raw.nullable === true,
                };
                if (raw.nullable !== undefined && typeof raw.nullable !== 'boolean') {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {field: 'nullable'},
                        message: 'Attribute nullable flag must be boolean.',
                        path: `${rawPointer}/nullable`,
                    });
                }
                if (raw.storage !== undefined && !isObject(raw.storage)) {
                    checkObject(raw.storage, [], `${rawPointer}/storage`);
                } else if (isObject(raw.storage)) {
                    for (const dialect of Object.keys(raw.storage).sort()) {
                        let binding = raw.storage[dialect];
                        const pointer = `${rawPointer}/storage/${escapePointer(dialect)}`;
                        if (!checkObject(binding, ['params', 'type'], pointer)) binding = {};
                        if (binding.params !== undefined && !isObject(binding.params)) checkObject(binding.params, [], `${pointer}/params`);
                        res.storage[normalizeName(dialect)] = {
                            type: typeof binding.type === 'string' ? binding.type : '',
                            params: isObject(binding.params) ? copy(binding.params) : {},
                        };
                        record(`${canonicalPointer}/storage/${escapePointer(normalizeName(dialect))}`, pointer);
                    }
                }
                if (raw.default !== undefined) {
                    let value = raw.default;
                    if (!checkObject(value, ['kind', 'name', 'params', 'value'], `${rawPointer}/default`)) value = {};
                    if (value.kind === 'literal') {
                        res.default = {kind: 'literal', value: copy(value.value)};
                    } else if (value.kind === 'function') {
                        if (value.params !== undefined && !isObject(value.params)) checkObject(value.params, [], `${rawPointer}/default/params`);
                        res.default = {
                            kind: 'function',
                            name: typeof value.name === 'string' ? value.name : '',
                            params: isObject(value.params) ? copy(value.params) : {},
                        };
                    } else {
                        res.default = {kind: typeof value.kind === 'string' ? value.kind : ''};
                    }
                    record(`${canonicalPointer}/default`, `${rawPointer}/default`);
                }
                if (raw.generation !== undefined) {
                    let value = raw.generation;
                    if (!checkObject(value, ['kind', 'params'], `${rawPointer}/generation`)) value = {};
                    if (value.params !== undefined && !isObject(value.params)) checkObject(value.params, [], `${rawPointer}/generation/params`);
                    res.generation = {
                        kind: typeof value.kind === 'string' ? value.kind : '',
                        params: isObject(value.params) ? copy(value.params) : {},
                    };
                    record(`${canonicalPointer}/generation`, `${rawPointer}/generation`);
                }
                record(canonicalPointer, rawPointer);
                return res;
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} name
             * @returns {any}
             */
            const decodeIndex = function (raw, rawPointer, canonicalPointer, name) {
                if (!checkObject(raw, ['include', 'keys', 'kind', 'method', 'options', 'phase', 'predicate'], rawPointer)) raw = {};
                const keys = Array.isArray(raw.keys) ? raw.keys : [];
                if (!Array.isArray(raw.keys)) {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {field: 'keys'},
                        message: 'Index keys must be an array.',
                        path: `${rawPointer}/keys`,
                    });
                }
                const res = {
                    name,
                    kind: typeof raw.kind === 'string' ? raw.kind : '',
                    keys: [],
                    include: Array.isArray(raw.include) ? raw.include.map((item) => normalizeName(String(item))) : [],
                    options: isObject(raw.options) ? copy(raw.options) : {},
                    phase: typeof raw.phase === 'string' ? raw.phase : '',
                };
                if (raw.method !== undefined) res.method = typeof raw.method === 'string' ? raw.method : '';
                if (raw.options !== undefined && !isObject(raw.options)) checkObject(raw.options, [], `${rawPointer}/options`);
                if (raw.include !== undefined && !Array.isArray(raw.include)) {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {field: 'include'},
                        message: 'Included columns must be an array.',
                        path: `${rawPointer}/include`,
                    });
                }
                keys.forEach((rawKey, index) => {
                    const path = `${rawPointer}/keys/${index}`;
                    let key = rawKey;
                    if (!checkObject(key, ['attr', 'expression', 'nulls', 'operatorClass', 'order'], path)) key = {};
                    const value = {};
                    if (key.attr !== undefined) value.attr = typeof key.attr === 'string' ? normalizeName(key.attr) : '';
                    if (key.expression !== undefined) value.expression = decodeExpression(key.expression, `${path}/expression`);
                    if (key.order !== undefined) value.order = key.order;
                    if (key.nulls !== undefined) value.nulls = key.nulls;
                    if (key.operatorClass !== undefined) value.operatorClass = key.operatorClass;
                    res.keys.push(value);
                });
                if (raw.predicate !== undefined) res.predicate = decodeExpression(raw.predicate, `${rawPointer}/predicate`);
                record(canonicalPointer, rawPointer);
                return res;
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} name
             * @returns {any}
             */
            const decodeRelation = function (raw, rawPointer, canonicalPointer, name) {
                if (!checkObject(raw, ['action', 'attrs', 'deferrable', 'ref'], rawPointer)) raw = {};
                let ref = raw.ref;
                if (!checkObject(ref, ['attrs', 'path'], `${rawPointer}/ref`)) ref = {};
                const action = isObject(raw.action) ? raw.action : {};
                if (raw.action !== undefined) checkObject(action, ['delete', 'update'], `${rawPointer}/action`);
                const res = {
                    name,
                    attrs: Array.isArray(raw.attrs) ? raw.attrs.map((item) => normalizeName(String(item))) : [],
                    ref: {
                        path: typeof ref.path === 'string' ? normalizePath(ref.path) : '',
                        attrs: Array.isArray(ref.attrs) ? ref.attrs.map((item) => normalizeName(String(item))) : [],
                    },
                    action: {},
                    deferrable: raw.deferrable ?? 'notDeferrable',
                };
                if (typeof action.delete === 'string') res.action.delete = action.delete;
                if (typeof action.update === 'string') res.action.update = action.update;
                if (!Array.isArray(raw.attrs)) {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {field: 'attrs'},
                        message: 'Relation local attributes must be an array.',
                        path: `${rawPointer}/attrs`,
                    });
                }
                if (!Array.isArray(ref.attrs)) {
                    addDiagnostic({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {field: 'ref.attrs'},
                        message: 'Relation target attributes must be an array.',
                        path: `${rawPointer}/ref/attrs`,
                    });
                }
                record(canonicalPointer, rawPointer);
                return res;
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} logicalPath
             * @param {boolean} root
             * @returns {any}
             */
            const decodeContainer = function (raw, rawPointer, canonicalPointer, logicalPath, root) {
                const allowed = root
                    ? ['entity', 'namespace', 'package', 'refs', 'requires', 'version']
                    : ['comment', 'entity', 'package'];
                if (!checkObject(raw, allowed, rawPointer)) raw = {};
                const res = {entity: {}, package: {}};
                if (!root && typeof raw.comment === 'string') {
                    res.comment = raw.comment;
                    record(`${canonicalPointer}/comment`, `${rawPointer}/comment`);
                }
                if (raw.entity !== undefined && !isObject(raw.entity)) {
                    checkObject(raw.entity, [], `${rawPointer}/entity`);
                } else if (isObject(raw.entity)) {
                    for (const rawName of Object.keys(raw.entity).sort()) {
                        const name = normalizeName(rawName);
                        const sourcePointer = `${rawPointer}/entity/${escapePointer(rawName)}`;
                        const targetPointer = `${canonicalPointer}/entity/${escapePointer(name)}`;
                        let item = raw.entity[rawName];
                        if (!checkObject(item, ['attr', 'comment', 'index', 'relation'], sourcePointer)) item = {};
                        const entity = {
                            name,
                            path: normalizePath(`${logicalPath}/${name}`),
                            comment: typeof item.comment === 'string' ? item.comment : '',
                            attr: {},
                            index: {},
                            relation: {},
                        };
                        const attr = isObject(item.attr) ? item.attr : {};
                        if (item.attr !== undefined && !isObject(item.attr)) checkObject(item.attr, [], `${sourcePointer}/attr`);
                        for (const rawAttrName of Object.keys(attr).sort()) {
                            const attrName = normalizeName(rawAttrName);
                            entity.attr[attrName] = decodeAttr(
                                attr[rawAttrName],
                                `${sourcePointer}/attr/${escapePointer(rawAttrName)}`,
                                `${targetPointer}/attr/${escapePointer(attrName)}`,
                                attrName,
                            );
                        }
                        const index = isObject(item.index) ? item.index : {};
                        if (item.index !== undefined && !isObject(item.index)) checkObject(item.index, [], `${sourcePointer}/index`);
                        for (const rawIndexName of Object.keys(index).sort()) {
                            const indexName = normalizeName(rawIndexName);
                            entity.index[indexName] = decodeIndex(
                                index[rawIndexName],
                                `${sourcePointer}/index/${escapePointer(rawIndexName)}`,
                                `${targetPointer}/index/${escapePointer(indexName)}`,
                                indexName,
                            );
                        }
                        const relation = isObject(item.relation) ? item.relation : {};
                        if (item.relation !== undefined && !isObject(item.relation)) checkObject(item.relation, [], `${sourcePointer}/relation`);
                        for (const rawRelationName of Object.keys(relation).sort()) {
                            const relationName = normalizeName(rawRelationName);
                            entity.relation[relationName] = decodeRelation(
                                relation[rawRelationName],
                                `${sourcePointer}/relation/${escapePointer(rawRelationName)}`,
                                `${targetPointer}/relation/${escapePointer(relationName)}`,
                                relationName,
                            );
                        }
                        res.entity[name] = entity;
                        record(targetPointer, sourcePointer);
                    }
                }
                if (raw.package !== undefined && !isObject(raw.package)) {
                    checkObject(raw.package, [], `${rawPointer}/package`);
                } else if (isObject(raw.package)) {
                    for (const rawName of Object.keys(raw.package).sort()) {
                        const name = normalizeName(rawName);
                        const sourcePointer = `${rawPointer}/package/${escapePointer(rawName)}`;
                        const targetPointer = `${canonicalPointer}/package/${escapePointer(name)}`;
                        res.package[name] = decodeContainer(
                            raw.package[rawName],
                            sourcePointer,
                            targetPointer,
                            normalizePath(`${logicalPath}/${name}`),
                            false,
                        );
                    }
                }
                return res;
            };

            /**
             * @param {any} container
             * @param {any} segments
             * @returns {any}
             */
            const applyRoot = function (container, segments) {
                if (segments.length === 0) return container;
                const result = {entity: {}, package: {}};
                let cursor = result;
                for (const segment of segments) {
                    const child = {entity: {}, package: {}};
                    cursor.package[segment] = child;
                    cursor = child;
                }
                cursor.entity = container.entity;
                cursor.package = container.package;
                return result;
            };

            /**
             * @param {any} values
             * @param {any} segments
             * @returns {any}
             */
            const applyRootPointers = function (values, segments) {
                if (segments.length === 0) return values;
                const prefix = segments.map((item) => `/package/${escapePointer(item)}`).join('');
                const result = {};
                for (const [pointer, sourcePointer] of Object.entries(values)) {
                    const target = pointer === '/entity' || pointer.startsWith('/entity/') || pointer === '/package' || pointer.startsWith('/package/')
                        ? `${prefix}${pointer}`
                        : pointer;
                    result[target] = sourcePointer;
                }
                return result;
            };

            /**
             * @param {any} container
             * @param {any} paths
             */
            const collectEntityPaths = function (container, paths) {
                for (const entity of Object.values(container.entity ?? {})) paths.add(entity.path);
                for (const child of Object.values(container.package ?? {})) collectEntityPaths(child, paths);
            };

            /**
             * @param {any} container
             * @param {any} paths
             * @param {any} refs
             * @param {string} rootPath
             */
            const resolveLocalRelations = function (container, paths, refs, rootPath) {
                for (const entity of Object.values(container.entity ?? {})) {
                    for (const relation of Object.values(entity.relation ?? {})) {
                        const path = relation.ref?.path;
                        if (!rootPath || !path || Object.prototype.hasOwnProperty.call(refs, path)) continue;
                        const rooted = normalizePath(`${rootPath}${path}`);
                        if (paths.has(rooted)) relation.ref.path = rooted;
                    }
                }
                for (const child of Object.values(container.package ?? {})) resolveLocalRelations(child, paths, refs, rootPath);
            };

            const raw = envelope.declaration;
            if (!isObject(raw)) {
                addDiagnostic({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {expected: 'object'},
                    message: 'The DEM declaration root must be an object.',
                    path: '',
                });
            }
            if (raw?.version !== 2) {
                addDiagnostic({
                    code: 'DEM_DECLARATION_VERSION_UNSUPPORTED',
                    details: {version: raw?.version},
                    message: 'Explicit DEM version must be integer 2.',
                    path: '/version',
                });
            }
            if (raw?.namespace !== undefined && typeof raw.namespace !== 'string') {
                addDiagnostic({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {field: 'namespace'},
                    message: 'Fragment root namespace must be a string.',
                    path: '/namespace',
                });
            }
            const rawNamespace = typeof raw?.namespace === 'string' ? raw.namespace : '';
            const namespaceSegments = rawNamespace.length > 0 && rawNamespace.split('.').every((item) => localIdentifier.test(item))
                ? rawNamespace.split('.')
                : [];
            const rootPath = namespaceSegments.length > 0 ? normalizePath(namespaceSegments.join('/')) : '';
            const decoded = decodeContainer(isObject(raw) ? raw : {}, '', '', rootPath, true);
            const declaration = applyRoot(decoded, namespaceSegments);
            declaration.version = 2;
            declaration.requires = [];
            if (raw?.requires !== undefined && !Array.isArray(raw.requires)) {
                addDiagnostic({
                    code: 'DEM_DECLARATION_SHAPE_INVALID',
                    details: {field: 'requires'},
                    message: 'Capability requirements must be an array.',
                    path: '/requires',
                });
            } else if (Array.isArray(raw?.requires)) {
                for (let index = 0; index < raw.requires.length; index++) {
                    const value = raw.requires[index];
                    if (typeof value !== 'string' || value.length === 0) {
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {field: 'requires'},
                            message: 'Capability identity must be a non-empty string.',
                            path: `/requires/${index}`,
                        });
                    } else {
                        declaration.requires.push(value);
                        record(`/requires/${escapePointer(value)}`, `/requires/${index}`);
                    }
                }
            }
            declaration.refs = {};
            if (raw?.refs !== undefined && !isObject(raw.refs)) {
                checkObject(raw.refs, [], '/refs');
            } else if (isObject(raw?.refs)) {
                for (const refPath of Object.keys(raw.refs).sort()) {
                    const value = raw.refs[refPath];
                    const normalized = normalizePath(refPath);
                    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {expected: 'string[]'},
                            message: 'An external reference must contain an attribute-name array.',
                            path: `/refs/${escapePointer(refPath)}`,
                        });
                    } else {
                        declaration.refs[normalized] = value.map(normalizeName);
                        record(`/refs/${escapePointer(normalized)}`, `/refs/${escapePointer(refPath)}`);
                    }
                }
            }
            const entityPaths = new Set();
            collectEntityPaths(declaration, entityPaths);
            resolveLocalRelations(declaration, entityPaths, declaration.refs, rootPath);
            return {declaration, diagnostics, envelope, pointers: applyRootPointers(pointers, namespaceSegments)};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        source: 'TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory$',
    }),
});
