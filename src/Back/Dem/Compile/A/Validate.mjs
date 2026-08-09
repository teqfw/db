// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_Validate
 * @description Enforces canonical DEM logical types, indexes, relations, names, and provenance.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_Validate {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic.Factory} deps.diagnostic
     * @param {TeqFw_Db_Back_Dem_Registry_Core} deps.core
     */
    constructor({diagnostic, core}) {
        /**
         * @param {string} value
         * @returns {string}
         */
        const escapePointer = function (value) {
            return value.replaceAll('~', '~0').replaceAll('/', '~1');
        };

        /**
         * @param {any} value
         * @returns {any}
         */
        const normalize = function (value) {
            if (Array.isArray(value)) return value.map(normalize);
            if (value && typeof value === 'object') {
                const res = {};
                for (const key of Object.keys(value).sort()) res[key] = normalize(value[key]);
                return res;
            }
            return value;
        };

        /**
         * @param {object} deps
         * @param {object} deps.mapped
         * @returns {object}
         */
        this.exec = function ({mapped}) {
            const diagnostics = [...mapped.diagnostics];
            const entities = {};
            const model = mapped.model;
            const physicalNames = {};
            const provenance = mapped.provenance;

            /**
             * @param {object} deps
             * @param {string} deps.code
             * @param {object} deps.details
             * @param {string} deps.message
             * @param {string} deps.path
             * @param {string} deps.stage
             */
            const addDiagnostic = function ({code, details = {}, message, path, stage = 'logical'}) {
                diagnostics.push(diagnostic.create({
                    code,
                    details,
                    message,
                    path,
                    sources: provenance[path] ?? [],
                    stage,
                }));
            };

            /**
             * @param {string} path
             */
            const requireProvenance = function (path) {
                if (!Array.isArray(provenance[path]) || provenance[path].length === 0) {
                    addDiagnostic({
                        code: 'DEM_PROVENANCE_MISSING',
                        details: {},
                        message: 'A canonical semantic node lacks trusted source provenance.',
                        path,
                        stage: 'composition',
                    });
                }
            };

            /**
             * @param {object} type
             * @returns {string}
             */
            const typeSignature = function (type) {
                return JSON.stringify(normalize({id: type?.id, params: type?.params ?? {}}));
            };

            /**
             * @param {any} value
             * @param {object} type
             * @param {boolean} nullable
             * @returns {boolean}
             */
            const literalMatches = function (value, type, nullable) {
                if (value === null) return nullable;
                const params = type.params ?? {};
                switch (type.id) {
                    case 'core.binary':
                        return typeof value === 'string' && (params.length === undefined || value.length <= params.length);
                    case 'core.boolean':
                        return typeof value === 'boolean';
                    case 'core.date':
                        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
                        {
                            const [year, month, day] = value.split('-').map(Number);
                            const parsed = new Date(Date.UTC(year, month - 1, day));
                            return parsed.getUTCFullYear() === year
                                && parsed.getUTCMonth() === month - 1
                                && parsed.getUTCDate() === day;
                        }
                    case 'core.datetime':
                        return typeof value === 'string' && !Number.isNaN(Date.parse(value));
                    case 'core.decimal':
                        if (!((typeof value === 'number' && Number.isFinite(value)) || typeof value === 'string')) return false;
                        {
                            const literal = String(value);
                            if (!/^-?\d+(?:\.\d+)?$/.test(literal)) return false;
                            const [integer, fraction = ''] = literal.replace('-', '').split('.');
                            const integerDigits = integer.replace(/^0+/, '').length;
                            return integerDigits <= params.precision - params.scale && fraction.length <= params.scale
                                && (params.unsigned !== true || !literal.startsWith('-'));
                        }
                    case 'core.enum':
                        return typeof value === 'string' && params.values.includes(value);
                    case 'core.integer':
                        if (!Number.isSafeInteger(value)) return false;
                        {
                            const bits = params.bits ?? 32;
                            const minimum = params.unsigned ? 0 : bits === 64 ? Number.MIN_SAFE_INTEGER : -(2 ** (bits - 1));
                            const maximum = bits === 64 ? Number.MAX_SAFE_INTEGER
                                : params.unsigned ? 2 ** bits - 1 : 2 ** (bits - 1) - 1;
                            return value >= minimum && value <= maximum;
                        }
                    case 'core.json':
                        try {
                            return value !== undefined && JSON.stringify(value) !== undefined;
                        } catch {
                            return false;
                        }
                    case 'core.string':
                        return typeof value === 'string' && value.length <= params.length;
                    case 'core.text':
                        return typeof value === 'string';
                    case 'core.uuid':
                        return typeof value === 'string'
                            && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
                    case 'core.vector':
                        if (params.element === 'bit') {
                            return typeof value === 'string' && value.length === params.dimensions && /^[01]+$/.test(value);
                        }
                        if (params.sparse === true) {
                            if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
                            if (value.dimensions !== params.dimensions || !Array.isArray(value.entries)) return false;
                            let previous = 0;
                            for (const entry of value.entries) {
                                if (!entry || !Number.isInteger(entry.index) || entry.index <= previous
                                    || entry.index > params.dimensions || !Number.isFinite(entry.value) || entry.value === 0) return false;
                                previous = entry.index;
                            }
                            return true;
                        }
                        return Array.isArray(value) && value.length === params.dimensions
                            && value.every((item) => typeof item === 'number' && Number.isFinite(item));
                    default:
                        return false;
                }
            };

            /**
             * @param {object} attr
             * @param {string} path
             * @returns {string|null}
             */
            const validateType = function (attr, path) {
                const value = attr.type;
                const entry = core.types[value?.id];
                if (!entry) {
                    addDiagnostic({
                        code: 'DEM_TYPE_UNKNOWN',
                        details: {type: value?.id},
                        message: 'Logical type identity is not registered.',
                        path,
                    });
                    return null;
                }
                const params = value.params && typeof value.params === 'object' && !Array.isArray(value.params)
                    ? {...value.params} : {};
                const allowed = entry.params.allowed ?? [];
                let valid = true;
                for (const key of Object.keys(params)) {
                    if (!allowed.includes(key)) valid = false;
                }
                Object.assign(params, entry.params.defaults ?? {} , value.params ?? {});
                switch (value.id) {
                    case 'core.binary':
                        valid = valid && (params.length === undefined || Number.isInteger(params.length) && params.length > 0);
                        break;
                    case 'core.datetime':
                        valid = valid && typeof params.timezone === 'boolean'
                            && (params.precision === undefined || Number.isInteger(params.precision) && params.precision >= 0);
                        break;
                    case 'core.decimal':
                        valid = valid && Number.isInteger(params.precision) && params.precision > 0
                            && Number.isInteger(params.scale) && params.scale >= 0 && params.scale <= params.precision
                            && typeof params.unsigned === 'boolean';
                        break;
                    case 'core.enum':
                        valid = valid && Array.isArray(params.values) && params.values.length > 0
                            && params.values.every((item) => typeof item === 'string')
                            && new Set(params.values).size === params.values.length;
                        break;
                    case 'core.integer':
                        valid = valid && [8, 16, 32, 64].includes(params.bits) && typeof params.unsigned === 'boolean';
                        break;
                    case 'core.string':
                        valid = valid && Number.isInteger(params.length) && params.length > 0;
                        break;
                    case 'core.vector':
                        valid = valid && Number.isInteger(params.dimensions) && params.dimensions > 0
                            && (params.element === 'float' || params.element === 'bit')
                            && typeof params.sparse === 'boolean'
                            && !(params.element === 'bit' && params.sparse === true);
                        break;
                }
                if (!valid) {
                    addDiagnostic({
                        code: 'DEM_TYPE_PARAMS_INVALID',
                        details: {params: normalize(params), type: value.id},
                        message: 'Logical type parameters violate the registered core contract.',
                        path,
                    });
                    return null;
                }
                attr.type = {id: value.id, params: normalize(params)};
                return typeSignature(attr.type);
            };

            /**
             * @param {object} attr
             * @param {string} path
             */
            const validateDefaultAndGeneration = function (attr, path) {
                if (attr.default !== undefined && attr.generation !== undefined) {
                    addDiagnostic({
                        code: 'DEM_DEFAULT_INVALID',
                        details: {generation: attr.generation.kind},
                        message: 'Default value and generation are mutually exclusive.',
                        path: `${path}/default`,
                    });
                }
                if (attr.default !== undefined) {
                    const value = attr.default;
                    let valid = value && (value.kind === 'literal' || value.kind === 'function');
                    if (value?.kind === 'literal') valid = valid && literalMatches(value.value, attr.type, attr.nullable);
                    if (value?.kind === 'function') {
                        const entry = core.defaults[value.name];
                        valid = valid && Boolean(entry) && entry.types.includes(attr.type.id)
                            && value.params && typeof value.params === 'object' && Object.keys(value.params).length === 0;
                    }
                    if (!valid) {
                        addDiagnostic({
                            code: 'DEM_DEFAULT_INVALID',
                            details: {kind: value?.kind, type: attr.type?.id},
                            message: 'Attribute default is unknown or incompatible with its logical type.',
                            path: `${path}/default`,
                        });
                    }
                }
                if (attr.generation !== undefined) {
                    const value = attr.generation;
                    const entry = core.generations[value?.kind];
                    const params = value?.params && typeof value.params === 'object' ? {...value.params} : {};
                    if (entry) Object.assign(params, entry.params.defaults ?? {}, value.params ?? {});
                    const valid = Boolean(entry) && entry.types.includes(attr.type?.id)
                        && Object.keys(params).every((key) => entry.params.allowed.includes(key))
                        && params.mode !== undefined && ['always', 'byDefault'].includes(params.mode);
                    if (!valid) {
                        addDiagnostic({
                            code: 'DEM_GENERATION_INVALID',
                            details: {kind: value?.kind, type: attr.type?.id},
                            message: 'Attribute generation is unknown or incompatible with its logical type.',
                            path: `${path}/generation`,
                        });
                    } else {
                        attr.generation = {kind: value.kind, params: normalize(params)};
                    }
                }
            };

            /**
             * @param {any} value
             * @returns {object|null}
             */
            const inferValueType = function (value) {
                if (typeof value === 'boolean') return {id: 'core.boolean', params: {}};
                if (Number.isSafeInteger(value)) return {id: 'core.integer', params: {bits: 32, unsigned: false}};
                if (typeof value === 'number' && Number.isFinite(value)) return {id: 'core.decimal', params: {precision: 18, scale: 6, unsigned: false}};
                if (typeof value === 'string') return {id: 'core.text', params: {}};
                return null;
            };

            /**
             * @param {object} expression
             * @param {object} entityInfo
             * @param {string} context
             * @param {string} path
             * @returns {object|null}
             */
            const validateExpression = function (expression, entityInfo, context, path) {
                if (expression?.kind === 'attr') {
                    const attr = entityInfo.entity.attr[expression.name];
                    if (!attr) {
                        addDiagnostic({
                            code: 'DEM_REFERENCE_ATTRIBUTE_MISSING',
                            details: {attribute: expression.name},
                            message: 'Expression references an unknown entity attribute.',
                            path,
                        });
                        return null;
                    }
                    return attr.type;
                }
                if (expression?.kind === 'value') return expression.type ?? inferValueType(expression.value);
                if (expression?.kind !== 'call') {
                    addDiagnostic({
                        code: 'DEM_EXPRESSION_INVALID',
                        details: {kind: expression?.kind},
                        message: 'Expression node kind is invalid.',
                        path,
                    });
                    return null;
                }
                const operator = core.operators[expression.operator];
                if (!operator || !operator.contexts.includes(context)) {
                    addDiagnostic({
                        code: 'DEM_EXPRESSION_INVALID',
                        details: {context, operator: expression.operator},
                        message: 'Expression operator is unknown or forbidden in this context.',
                        path,
                    });
                    return null;
                }
                const args = Array.isArray(expression.args) ? expression.args : [];
                const arityValid = typeof operator.arity === 'number'
                    ? args.length === operator.arity : args.length >= operator.arity.min;
                const types = args.map((arg, index) => validateExpression(arg, entityInfo, context, `${path}/args/${index}`));
                let typesValid = arityValid && types.every(Boolean);
                if (typesValid && operator.args === 'boolean') typesValid = types.every((type) => type.id === 'core.boolean');
                if (typesValid && (operator.args === 'same' || operator.args === 'orderedSame')) {
                    typesValid = types.every((type) => typeSignature(type) === typeSignature(types[0]));
                    if (typesValid && operator.args === 'orderedSame') {
                        typesValid = ['core.date', 'core.datetime', 'core.decimal', 'core.integer', 'core.string', 'core.text'].includes(types[0].id);
                    }
                }
                if (typesValid && Array.isArray(operator.args)) typesValid = operator.args.includes(types[0].id);
                if (!typesValid) {
                    addDiagnostic({
                        code: 'DEM_EXPRESSION_INVALID',
                        details: {arity: args.length, operator: expression.operator, types: types.filter(Boolean).map((type) => type.id)},
                        message: 'Expression operator arity or logical argument types are invalid.',
                        path,
                    });
                    return null;
                }
                return operator.result === 'same' ? types[0] : {id: operator.result, params: {}};
            };
            /** @param {object} expression @param {Set<string>} values @returns {Set<string>} */
            const collectExpressionAttrs = function (expression, values = new Set()) {
                if (expression?.kind === 'attr' && typeof expression.name === 'string') values.add(expression.name);
                for (const arg of expression?.args ?? []) collectExpressionAttrs(arg, values);
                return values;
            };


            /**
             * @param {object} container
             * @param {string} pointer
             */
            const collect = function (container, pointer) {
                if (Object.prototype.hasOwnProperty.call(container, 'comment')) requireProvenance(`${pointer}/comment`);
                for (const entityName of Object.keys(container.entity ?? {}).sort()) {
                    const entity = container.entity[entityName];
                    const entityPointer = `${pointer}/entity/${escapePointer(entityName)}`;
                    requireProvenance(entityPointer);
                    const tableBase = entity.path.split('/').filter(Boolean).join('_');
                    const tableName = model.namespace ? `${model.namespace}_${tableBase}` : tableBase;
                    if (physicalNames[tableName] && physicalNames[tableName] !== entity.path) {
                        addDiagnostic({
                            code: 'DEM_PHYSICAL_NAME_COLLISION',
                            details: {entities: [physicalNames[tableName], entity.path].sort(), name: tableName},
                            message: 'Distinct logical entities map to the same physical table name.',
                            path: entityPointer,
                            stage: 'dialect',
                        });
                    } else physicalNames[tableName] = entity.path;
                    entities[entity.path] = {
                        entity,
                        pointer: entityPointer,
                        signatures: {},
                        tableName,
                        uniqueKeys: [],
                    };
                    for (const attrName of Object.keys(entity.attr ?? {}).sort()) {
                        const attr = entity.attr[attrName];
                        const attrPointer = `${entityPointer}/attr/${escapePointer(attrName)}`;
                        requireProvenance(attrPointer);
                        const signature = validateType(attr, attrPointer);
                        if (signature) entities[entity.path].signatures[attrName] = signature;
                        validateDefaultAndGeneration(attr, attrPointer);
                        for (const dialect of Object.keys(attr.storage ?? {}).sort()) {
                            requireProvenance(`${attrPointer}/storage/${escapePointer(dialect)}`);
                        }
                        if (attr.default !== undefined) requireProvenance(`${attrPointer}/default`);
                        if (attr.generation !== undefined) requireProvenance(`${attrPointer}/generation`);
                    }
                    let primaryCount = 0;
                    for (const indexName of Object.keys(entity.index ?? {}).sort()) {
                        const index = entity.index[indexName];
                        const indexPointer = `${entityPointer}/index/${escapePointer(indexName)}`;
                        requireProvenance(indexPointer);
                        let valid = ['index', 'primary', 'unique'].includes(index.kind)
                            && Array.isArray(index.keys) && index.keys.length > 0
                            && ['afterData', 'afterRelations', 'table'].includes(index.phase);
                        if (index.kind === 'primary') primaryCount++;
                        if (index.kind === 'index') valid = valid && typeof index.method === 'string' && index.method.length > 0;
                        if (index.kind === 'primary' || index.kind === 'unique') {
                            valid = valid && index.method === undefined && index.phase === 'table'
                                && index.predicate === undefined && (index.include?.length ?? 0) === 0
                                && Object.keys(index.options ?? {}).length === 0
                                && index.keys.every((key) => typeof key.attr === 'string'
                                    && Object.keys(key).every((field) => field === 'attr'));
                        }
                        const direct = [];
                        const keyAttributes = new Set();
                        for (let keyIndex = 0; keyIndex < (index.keys ?? []).length; keyIndex++) {
                            const key = index.keys[keyIndex];
                            const exactlyOne = (typeof key.attr === 'string') !== Boolean(key.expression);
                            valid = valid && exactlyOne;
                            if (typeof key.attr === 'string') {
                                direct.push(key.attr);
                                keyAttributes.add(key.attr);
                                if (!entity.attr[key.attr]) {
                                    valid = false;
                                    addDiagnostic({
                                        code: 'DEM_REFERENCE_ATTRIBUTE_MISSING',
                                        details: {attribute: key.attr, index: indexName},
                                        message: 'Index key references an unknown entity attribute.',
                                        path: indexPointer,
                                    });
                                }
                            } else if (key.expression) {
                                valid = Boolean(validateExpression(key.expression, entities[entity.path], 'index', `${indexPointer}/keys/${keyIndex}/expression`)) && valid;
                                for (const name of collectExpressionAttrs(key.expression)) keyAttributes.add(name);
                            }
                        }
                        valid = valid && new Set(direct).size === direct.length;
                        const include = Array.isArray(index.include) ? index.include : [];
                        valid = valid && include.every((name) => Boolean(entity.attr[name]) && !keyAttributes.has(name))
                            && new Set(include).size === include.length;
                        for (const name of include) {
                            if (!entity.attr[name]) {
                                addDiagnostic({
                                    code: 'DEM_REFERENCE_ATTRIBUTE_MISSING',
                                    details: {attribute: name, index: indexName},
                                    message: 'Included index column references an unknown entity attribute.',
                                    path: indexPointer,
                                });
                            }
                        }
                        if (index.predicate !== undefined) {
                            const predicateType = validateExpression(index.predicate, entities[entity.path], 'predicate', `${indexPointer}/predicate`);
                            valid = valid && predicateType?.id === 'core.boolean';
                        }
                        if (!valid) {
                            addDiagnostic({
                                code: 'DEM_INDEX_INVALID',
                                details: {index: indexName, kind: index.kind, phase: index.phase},
                                message: 'Index shape or cross-field invariant is invalid.',
                                path: indexPointer,
                            });
                        } else if (index.kind === 'primary' || index.kind === 'unique') {
                            entities[entity.path].uniqueKeys.push(direct);
                        }
                    }
                    if (primaryCount > 1) {
                        addDiagnostic({
                            code: 'DEM_INDEX_INVALID',
                            details: {primaryCount},
                            message: 'An entity may declare at most one primary key.',
                            path: `${entityPointer}/index`,
                        });
                    }
                }
                for (const packageName of Object.keys(container.package ?? {}).sort()) {
                    collect(container.package[packageName], `${pointer}/package/${escapePointer(packageName)}`);
                }
            };
            collect(model, '');

            for (const entityPath of Object.keys(entities).sort()) {
                const info = entities[entityPath];
                for (const relationName of Object.keys(info.entity.relation ?? {}).sort()) {
                    const relation = info.entity.relation[relationName];
                    const relationPointer = `${info.pointer}/relation/${escapePointer(relationName)}`;
                    requireProvenance(relationPointer);
                    const target = entities[relation.ref.path];
                    const attrs = Array.isArray(relation.attrs) ? relation.attrs : [];
                    const targetAttrs = Array.isArray(relation.ref?.attrs) ? relation.ref.attrs : [];
                    const cardinalityValid = attrs.length > 0 && targetAttrs.length > 0 && attrs.length === targetAttrs.length;
                    if (!cardinalityValid) {
                        addDiagnostic({
                            code: 'DEM_RELATION_CARDINALITY',
                            details: {local: attrs.length, target: targetAttrs.length},
                            message: 'Relation attribute lists must be non-empty and have equal cardinality.',
                            path: relationPointer,
                        });
                    }
                    if (!target) {
                        addDiagnostic({
                            code: 'DEM_REFERENCE_ENTITY_MISSING',
                            details: {target: relation.ref.path},
                            message: 'Resolved relation target entity does not exist.',
                            path: relationPointer,
                        });
                        continue;
                    }
                    let attributesExist = cardinalityValid;
                    for (let index = 0; cardinalityValid && index < attrs.length; index++) {
                        const local = attrs[index];
                        const remote = targetAttrs[index];
                        if (!info.entity.attr[local] || !target.entity.attr[remote]) {
                            attributesExist = false;
                            addDiagnostic({
                                code: 'DEM_REFERENCE_ATTRIBUTE_MISSING',
                                details: {local, target: remote},
                                message: 'Relation references an unknown local or target attribute.',
                                path: relationPointer,
                            });
                            continue;
                        }
                        if (info.signatures[local] && target.signatures[remote]
                            && info.signatures[local] !== target.signatures[remote]) {
                            addDiagnostic({
                                code: 'DEM_RELATION_TYPE_MISMATCH',
                                details: {local, target: remote},
                                message: 'Relation attributes have incompatible logical types.',
                                path: relationPointer,
                            });
                        }
                    }
                    if (attributesExist && !target.uniqueKeys.some((key) => JSON.stringify(key) === JSON.stringify(targetAttrs))) {
                        addDiagnostic({
                            code: 'DEM_RELATION_TARGET_NOT_UNIQUE',
                            details: {attrs: targetAttrs, target: relation.ref.path},
                            message: 'Relation target attributes are not a declared primary or unique key.',
                            path: relationPointer,
                        });
                    }
                    const actions = Object.values(relation.action ?? {});
                    if (!actions.every((value) => value === 'cascade' || value === 'restrict')
                        || !['deferred', 'immediate', 'notDeferrable'].includes(relation.deferrable)) {
                        addDiagnostic({
                            code: 'DEM_DECLARATION_SHAPE_INVALID',
                            details: {action: relation.action, deferrable: relation.deferrable},
                            message: 'Relation action or deferrability value is invalid.',
                            path: relationPointer,
                        });
                    }
                }
            }
            return {...mapped, diagnostics, entities, model};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        core: 'TeqFw_Db_Back_Dem_Registry_Core$',
    }),
});
