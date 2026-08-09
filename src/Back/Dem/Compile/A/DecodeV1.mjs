// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_DecodeV1
 * @description Decodes an unversioned legacy DEM fragment into canonical v2 logical values.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_DecodeV1 {
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
            const parts = value.split('/').map(normalizeName).filter(Boolean);
            return `/${parts.join('/')}`;
        };

        /**
         * @param {any} value
         * @returns {any}
         */
        const copy = function (value) {
            if (Array.isArray(value)) return value.map(copy);
            if (isObject(value)) {
                const res = {};
                for (const key of Object.keys(value)) res[key] = copy(value[key]);
                return res;
            }
            return value;
        };

        /**
         * @param {object} deps
         * @param {object} deps.envelope
         * @returns {object}
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
             * @returns {object}
             */
            const makeSource = function (sourcePointer) {
                return source.create({
                    filename: envelope.filename,
                    fragmentId: envelope.fragmentId,
                    packageName: envelope.packageName,
                    sourcePointer,
                });
            };

            /**
             * @param {object} deps
             * @param {string} deps.code
             * @param {object} deps.details
             * @param {string} deps.message
             * @param {string} deps.path
             * @param {'error'|'warning'} deps.severity
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
             * @param {ReadonlyArray<string>} allowed
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
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} name
             * @returns {object}
             */
            const decodeAttr = function (raw, rawPointer, canonicalPointer, name) {
                if (!checkObject(raw, ['comment', 'default', 'nullable', 'options', 'type'], rawPointer)) raw = {};
                const options = isObject(raw.options) ? raw.options : {};
                if (raw.options !== undefined) {
                    checkObject(options, ['dateOnly', 'isTiny', 'length', 'precision', 'scale', 'unsigned', 'values'], `${rawPointer}/options`);
                }
                const legacyType = typeof raw.type === 'string' ? raw.type : '';
                const length = Number.isInteger(options.length) && options.length > 0 ? options.length : undefined;
                let type;
                let generation;
                let compatibility;
                switch (legacyType) {
                    case 'binary':
                        type = {id: 'core.binary', params: length ? {length} : {}};
                        compatibility = {source: 'v1', physical: 'binary'};
                        break;
                    case 'boolean':
                        type = {id: 'core.boolean', params: {}};
                        compatibility = {source: 'v1', physical: 'boolean'};
                        break;
                    case 'datetime':
                        type = options.dateOnly === true
                            ? {id: 'core.date', params: {}}
                            : {id: 'core.datetime', params: {timezone: false}};
                        compatibility = {source: 'v1', physical: options.dateOnly === true ? 'date' : 'datetime'};
                        break;
                    case 'enum':
                        type = {id: 'core.enum', params: {values: Array.isArray(options.values) ? [...options.values] : []}};
                        compatibility = {source: 'v1', physical: 'enum'};
                        break;
                    case 'id':
                        type = {id: 'core.integer', params: {bits: 32, unsigned: false}};
                        generation = {kind: 'core.identity', params: {mode: 'byDefault'}};
                        compatibility = {source: 'v1', physical: 'increments'};
                        break;
                    case 'integer':
                        type = {id: 'core.integer', params: {bits: options.isTiny === true ? 8 : 32, unsigned: options.unsigned === true}};
                        compatibility = {source: 'v1', physical: options.isTiny === true ? 'tinyint' : 'integer'};
                        break;
                    case 'json':
                        type = {id: 'core.json', params: {}};
                        compatibility = {source: 'v1', physical: 'jsonb'};
                        break;
                    case 'number': {
                        const hasPrecision = Number.isInteger(options.precision);
                        const hasScale = Number.isInteger(options.scale);
                        if (!hasPrecision && !hasScale) {
                            type = {id: 'core.integer', params: {bits: 32, unsigned: options.unsigned === true}};
                            compatibility = {source: 'v1', physical: 'integer'};
                            addDiagnostic({
                                code: 'DEM_V1_AMBIGUOUS_NUMBER',
                                details: {legacyType: 'number'},
                                message: 'Legacy number without precision and scale retains integer behavior.',
                                path: rawPointer,
                                severity: 'warning',
                            });
                        } else {
                            const scale = hasScale ? options.scale : 0;
                            const precision = hasPrecision ? options.precision : Math.max(8, scale);
                            type = {id: 'core.decimal', params: {precision, scale, unsigned: options.unsigned === true}};
                            compatibility = {
                                source: 'v1',
                                physical: 'decimal',
                                precision: hasPrecision ? options.precision : null,
                                scale: hasScale ? options.scale : null,
                            };
                            if (!hasPrecision || !hasScale) {
                                addDiagnostic({
                                    code: 'DEM_V1_PARTIAL_DECIMAL',
                                    details: {hasPrecision, hasScale},
                                    message: 'Legacy partial decimal retains its adapter-specific builder behavior.',
                                    path: rawPointer,
                                    severity: 'warning',
                                });
                            }
                        }
                        break;
                    }
                    case 'ref':
                        type = {id: 'core.integer', params: {bits: 32, unsigned: false}};
                        compatibility = {source: 'v1', physical: 'integerUnsigned'};
                        break;
                    case 'string':
                        type = {id: 'core.string', params: {length: length ?? 255}};
                        compatibility = {source: 'v1', physical: 'string', declaredLength: length ?? null};
                        break;
                    case 'text':
                        type = {id: 'core.text', params: {}};
                        compatibility = {source: 'v1', physical: 'text'};
                        break;
                    default:
                        type = {id: legacyType, params: {}};
                        compatibility = {source: 'v1', physical: legacyType};
                }
                compatibility.legacyType = legacyType;
                const res = {
                    name,
                    comment: typeof raw.comment === 'string' ? raw.comment : '',
                    type,
                    storage: {},
                    nullable: raw.nullable === true,
                    compatibility,
                };
                if (generation) res.generation = generation;
                if (Object.prototype.hasOwnProperty.call(raw, 'default')) {
                    if (raw.default === 'current' && type.id === 'core.date') {
                        res.default = {kind: 'function', name: 'core.currentDate', params: {}};
                    } else if (raw.default === 'current' && type.id === 'core.datetime') {
                        res.default = {kind: 'function', name: 'core.currentTimestamp', params: {}};
                    } else {
                        res.default = {kind: 'literal', value: copy(raw.default)};
                    }
                }
                record(canonicalPointer, rawPointer);
                if (res.default) record(`${canonicalPointer}/default`, `${rawPointer}/default`);
                if (res.generation) record(`${canonicalPointer}/generation`, rawPointer);
                return res;
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} name
             * @returns {object}
             */
            const decodeIndex = function (raw, rawPointer, canonicalPointer, name) {
                if (!checkObject(raw, ['attrs', 'type'], rawPointer)) raw = {};
                const kind = typeof raw.type === 'string' ? raw.type : '';
                const res = {
                    name,
                    kind,
                    keys: Array.isArray(raw.attrs) ? raw.attrs.map((attr) => ({attr: normalizeName(String(attr))})) : [],
                    include: [],
                    options: {},
                    phase: 'table',
                    compatibility: {source: 'v1'},
                };
                if (kind === 'index') res.method = 'legacy.defaultIndex';
                record(canonicalPointer, rawPointer);
                return res;
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} name
             * @returns {object}
             */
            const decodeRelation = function (raw, rawPointer, canonicalPointer, name) {
                if (!checkObject(raw, ['action', 'attrs', 'ref'], rawPointer)) raw = {};
                const ref = isObject(raw.ref) ? raw.ref : {};
                checkObject(ref, ['attrs', 'path'], `${rawPointer}/ref`);
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
                    deferrable: 'notDeferrable',
                };
                if (typeof action.delete === 'string') res.action.delete = action.delete.toLowerCase();
                if (typeof action.update === 'string') res.action.update = action.update.toLowerCase();
                record(canonicalPointer, rawPointer);
                return res;
            };

            /**
             * @param {any} raw
             * @param {string} rawPointer
             * @param {string} canonicalPointer
             * @param {string} logicalPath
             * @returns {object}
             */
            const decodeContainer = function (raw, rawPointer, canonicalPointer, logicalPath) {
                if (!checkObject(raw, ['comment', 'entity', 'package', 'refs'], rawPointer)) raw = {};
                const res = {entity: {}, package: {}};
                if (typeof raw.comment === 'string') {
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
                        );
                    }
                }
                return res;
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
            const declaration = decodeContainer(isObject(raw) ? raw : {}, '', '', '');
            declaration.version = 2;
            declaration.requires = [];
            declaration.refs = {};
            if (isObject(raw?.refs)) {
                for (const refPath of Object.keys(raw.refs).sort()) {
                    const normalized = normalizePath(refPath);
                    const value = raw.refs[refPath];
                    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {expected: 'string[]'},
                            message: 'A legacy external reference must contain an attribute-name array.',
                            path: `/refs/${escapePointer(refPath)}`,
                        });
                    } else {
                        declaration.refs[normalized] = value.map(normalizeName);
                        record(`/refs/${escapePointer(normalized)}`, `/refs/${escapePointer(refPath)}`);
                    }
                }
            } else if (raw?.refs !== undefined) {
                checkObject(raw.refs, [], '/refs');
            }
            return {declaration, diagnostics, envelope, pointers};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        source: 'TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory$',
    }),
});
