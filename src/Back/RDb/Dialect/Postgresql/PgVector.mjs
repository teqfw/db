// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector
 * @description Versioned pgvector registries, codecs, preflight, and safe PostgreSQL execution.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector {
    /**
     * Initialize the pgvector 0.7 registry baseline.
     */
    constructor() {
        const extensionCapability = 'postgresql.extension.vector';
        const capabilities = Object.freeze([
            extensionCapability,
            'postgresql.type.vector',
            'postgresql.type.halfvec',
            'postgresql.type.bit',
            'postgresql.type.sparsevec',
            'postgresql.index.hnsw',
            'postgresql.index.ivfflat',
            'postgresql.query.vectorDistance',
        ]);
        const vectorTypes = new Set(['bit', 'halfvec', 'sparsevec', 'vector']);

        /** @param {any} value @returns {any} */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        /** @param {string} code @param {string} message @param {any} details @returns {any} */
        const diagnostic = function (code, message, details = {}) {
            return {code, details, message};
        };

        /** @param {any} value @param {number} minimum @param {number} maximum @returns {boolean} */
        const integerInRange = function (value, minimum, maximum) {
            return Number.isInteger(value) && value >= minimum && value <= maximum;
        };

        /** @param {string} installed @param {string} minimum @returns {boolean} */
        const versionAtLeast = function (installed, minimum) {
            /** @param {string} value @returns {any} */
            const parse = (value) => String(value).split(/[.-]/).slice(0, 3).map((part) => Number.parseInt(part, 10) || 0);
            const left = parse(installed);
            const right = parse(minimum);
            for (let index = 0; index < 3; index++) {
                if (left[index] > right[index]) return true;
                if (left[index] < right[index]) return false;
            }
            return true;
        };

        /** @param {any} type @param {any} value @returns {boolean} */
        const validCanonical = function (type, value) {
            const params = type?.params ?? {};
            if (type?.id !== 'core.vector' || !integerInRange(params.dimensions, 1, 1_000_000_000)) return false;
            if (params.element === 'bit') {
                return params.sparse === false && typeof value === 'string'
                    && value.length === params.dimensions && /^[01]+$/.test(value);
            }
            if (params.sparse === true) {
                if (!value || value.dimensions !== params.dimensions || !Array.isArray(value.entries)
                    || value.entries.length > 16_000) return false;
                return value.entries.every((entry, index, entries) => Number.isInteger(entry.index)
                    && entry.index > 0 && entry.index <= params.dimensions
                    && typeof entry.value === 'number' && Number.isFinite(entry.value) && entry.value !== 0
                    && (index === 0 || entries[index - 1].index < entry.index));
            }
            return params.element === 'float' && params.sparse === false && Array.isArray(value)
                && value.length === params.dimensions
                && value.every((item) => typeof item === 'number' && Number.isFinite(item));
        };

        const storageRules = Object.freeze({
            bit: {capability: 'postgresql.type.bit', maxDimensions: 64_000, element: 'bit', sparse: false},
            halfvec: {capability: 'postgresql.type.halfvec', maxDimensions: 16_000, element: 'float', sparse: false},
            sparsevec: {capability: 'postgresql.type.sparsevec', maxDimensions: 1_000_000_000, element: 'float', sparse: true},
            vector: {capability: 'postgresql.type.vector', maxDimensions: 16_000, element: 'float', sparse: false},
        });

        /** @param {string} physicalType @returns {any} */
        const storageEntry = function (physicalType) {
            const rule = storageRules[physicalType];
            return {
                requirements: [extensionCapability, rule.capability],
                project: function ({binding, logicalType}) {
                    const params = binding?.params;
                    const logical = logicalType?.params ?? {};
                    const diagnostics = [];
                    if (!params || typeof params !== 'object' || Array.isArray(params) || Object.keys(params).length !== 0) {
                        diagnostics.push(diagnostic('DEM_STORAGE_UNSUPPORTED', 'pgvector storage parameters must be an empty closed object.', {storage: physicalType}));
                    }
                    if (logicalType?.id !== 'core.vector' || logical.element !== rule.element || logical.sparse !== rule.sparse
                        || !integerInRange(logical.dimensions, 1, rule.maxDimensions)) {
                        diagnostics.push(diagnostic('DEM_STORAGE_UNSUPPORTED', 'Logical vector shape is incompatible with the selected pgvector storage.', {
                            dimensions: logical.dimensions, storage: physicalType, type: logicalType?.id,
                        }));
                    }
                    return {
                        diagnostics,
                        physicalType: diagnostics.length ? undefined : {
                            args: [logical.dimensions], dialect: 'postgresql', type: physicalType, unsigned: false,
                        },
                    };
                },
            };
        };

        const operatorClasses = Object.freeze({
            'postgresql.bit_hamming_ops': {methods: ['hnsw', 'ivfflat'], physical: 'bit_hamming_ops', storage: 'bit'},
            'postgresql.bit_jaccard_ops': {methods: ['hnsw'], physical: 'bit_jaccard_ops', storage: 'bit'},
            'postgresql.halfvec_cosine_ops': {methods: ['hnsw', 'ivfflat'], physical: 'halfvec_cosine_ops', storage: 'halfvec'},
            'postgresql.halfvec_ip_ops': {methods: ['hnsw', 'ivfflat'], physical: 'halfvec_ip_ops', storage: 'halfvec'},
            'postgresql.halfvec_l1_ops': {methods: ['hnsw'], physical: 'halfvec_l1_ops', storage: 'halfvec'},
            'postgresql.halfvec_l2_ops': {methods: ['hnsw', 'ivfflat'], physical: 'halfvec_l2_ops', storage: 'halfvec'},
            'postgresql.sparsevec_cosine_ops': {methods: ['hnsw'], physical: 'sparsevec_cosine_ops', storage: 'sparsevec'},
            'postgresql.sparsevec_ip_ops': {methods: ['hnsw'], physical: 'sparsevec_ip_ops', storage: 'sparsevec'},
            'postgresql.sparsevec_l1_ops': {methods: ['hnsw'], physical: 'sparsevec_l1_ops', storage: 'sparsevec'},
            'postgresql.sparsevec_l2_ops': {methods: ['hnsw'], physical: 'sparsevec_l2_ops', storage: 'sparsevec'},
            'postgresql.vector_cosine_ops': {methods: ['hnsw', 'ivfflat'], physical: 'vector_cosine_ops', storage: 'vector'},
            'postgresql.vector_ip_ops': {methods: ['hnsw', 'ivfflat'], physical: 'vector_ip_ops', storage: 'vector'},
            'postgresql.vector_l1_ops': {methods: ['hnsw'], physical: 'vector_l1_ops', storage: 'vector'},
            'postgresql.vector_l2_ops': {methods: ['hnsw', 'ivfflat'], physical: 'vector_l2_ops', storage: 'vector'},
        });

        /** @param {any} expression @returns {boolean} */
        const validPredicate = function (expression) {
            if (!expression) return true;
            if (expression.kind === 'attr') return typeof expression.name === 'string' && expression.name.length > 0;
            if (expression.kind !== 'call' || !Array.isArray(expression.args)) return false;
            if (['core.isNull', 'core.notNull', 'core.not'].includes(expression.operator)) {
                return expression.args.length === 1 && validPredicate(expression.args[0]);
            }
            if (['core.and', 'core.or'].includes(expression.operator)) {
                return expression.args.length >= 2 && expression.args.every(validPredicate);
            }
            return false;
        };

        /** @param {any} method @returns {any} */
        const indexEntry = function (method) {
            const requirement = `postgresql.index.${method}`;
            return {
                requirements: [extensionCapability, requirement],
                project: function ({entity, index, physicalName}) {
                    const diagnostics = [];
                    const key = index.keys?.[0];
                    const attr = key?.attr ? entity.attr?.[key.attr] : null;
                    const storage = attr?.storage?.postgresql?.type;
                    const operatorClass = operatorClasses[key?.operatorClass];
                    if (index.keys?.length !== 1 || !attr || key.expression !== undefined || key.order !== undefined
                        || key.nulls !== undefined || !operatorClass || operatorClass.storage !== storage
                        || !operatorClass.methods.includes(method)) {
                        diagnostics.push(diagnostic('DEM_INDEX_INVALID', 'pgvector index key, storage, method, and operator class are incompatible.', {
                            method: `postgresql.${method}`, operatorClass: key?.operatorClass, storage,
                        }));
                    }
                    if ((index.include?.length ?? 0) !== 0 || !validPredicate(index.predicate)) {
                        diagnostics.push(diagnostic('DEM_INDEX_INVALID', 'pgvector indexes do not accept INCLUDE or an unsupported predicate expression.', {
                            include: index.include ?? [], method: `postgresql.${method}`,
                        }));
                    }
                    const allowedOptions = method === 'hnsw'
                        ? {m: [2, 100], ef_construction: [4, 1000]} : {lists: [1, 32768]};
                    const options = index.options ?? {};
                    for (const name of Object.keys(options)) {
                        const range = allowedOptions[name];
                        if (!range || !integerInRange(options[name], range[0], range[1])) {
                            diagnostics.push(diagnostic('DEM_INDEX_INVALID', 'pgvector index option is unknown or outside the 0.7 registry range.', {
                                method: `postgresql.${method}`, option: name, value: options[name],
                            }));
                        }
                    }
                    if (method === 'ivfflat' && index.phase !== 'afterData') {
                        diagnostics.push(diagnostic('DEM_INDEX_INVALID', 'IVFFlat indexes must use the afterData phase.', {phase: index.phase}));
                    }
                    if (method === 'hnsw' && !['afterRelations', 'afterData'].includes(index.phase)) {
                        diagnostics.push(diagnostic('DEM_INDEX_INVALID', 'HNSW indexes must use afterRelations or afterData.', {phase: index.phase}));
                    }
                    const dimensions = attr?.type?.params?.dimensions;
                    const maxDimensions = storage === 'vector' ? 2000 : storage === 'halfvec' ? 4000 : storage === 'bit' ? 64000 : null;
                    if (maxDimensions && dimensions > maxDimensions) {
                        diagnostics.push(diagnostic('DEM_INDEX_INVALID', 'Vector dimensions exceed the selected pgvector 0.7 index limit.', {
                            dimensions, maximum: maxDimensions, storage,
                        }));
                    }
                    return {
                        descriptor: diagnostics.length ? undefined : {
                            include: [],
                            keys: [{attr: key.attr, operatorClass: operatorClass.physical}],
                            kind: 'index',
                            method,
                            name: physicalName,
                            options: structuredClone(options),
                            predicate: index.predicate === undefined ? undefined : structuredClone(index.predicate),
                            requirements: [extensionCapability, requirement],
                        },
                        diagnostics,
                    };
                },
            };
        };

        const storage = freeze({
            bit: storageEntry('bit'),
            halfvec: storageEntry('halfvec'),
            sparsevec: storageEntry('sparsevec'),
            vector: storageEntry('vector'),
        });
        const indexes = freeze({
            'postgresql.hnsw': indexEntry('hnsw'),
            'postgresql.ivfflat': indexEntry('ivfflat'),
        });
        const operators = freeze({
            'postgresql.pgvector.cosineDistance': {implementation: 'cosineDistance', physical: '<=>', storage: ['vector', 'halfvec', 'sparsevec']},
            'postgresql.pgvector.hammingDistance': {implementation: 'hammingDistance', physical: '<~>', storage: ['bit']},
            'postgresql.pgvector.jaccardDistance': {implementation: 'jaccardDistance', physical: '<%>', storage: ['bit']},
            'postgresql.pgvector.l1Distance': {implementation: 'l1Distance', physical: '<+>', storage: ['vector', 'halfvec', 'sparsevec']},
            'postgresql.pgvector.l2Distance': {implementation: 'l2Distance', physical: '<->', storage: ['vector', 'halfvec', 'sparsevec']},
            'postgresql.pgvector.negativeInnerProduct': {implementation: 'negativeInnerProduct', physical: '<#>', storage: ['vector', 'halfvec', 'sparsevec']},
        });

        /** @returns {any} */
        this.getStorageRegistry = function () {
            return storage;
        };

        /** @returns {any} */
        this.getIndexRegistry = function () {
            return indexes;
        };

        /** @returns {any} */
        this.getCapabilities = function () {
            return capabilities;
        };

        /**
         * @param {object} deps
         * @param {string} deps.operator
         * @param {object} deps.argumentTypes
         * @returns {any}
         */
        this.resolveOperator = function ({operator, argumentTypes = []}) {
            const entry = operators[operator];
            if (!entry) return null;
            const diagnostics = [];
            if (argumentTypes.length > 0) {
                const left = argumentTypes[0]?.params ?? {};
                const right = argumentTypes[1]?.params ?? {};
                const typesValid = argumentTypes.length === 2 && argumentTypes.every((type) => type?.id === 'core.vector')
                    && left.dimensions === right.dimensions && left.element === right.element && left.sparse === right.sparse;
                const logical = argumentTypes[0]?.params ?? {};
                const storageFamily = logical.element === 'bit' ? 'bit' : logical.sparse === true ? 'sparsevec' : 'vector';
                if (!typesValid || !entry.storage.includes(storageFamily)) {
                    diagnostics.push(diagnostic('DEM_EXPRESSION_INVALID', 'Distance operator argument types are incompatible.', {
                        operator, types: argumentTypes.map((type) => type?.id),
                    }));
                }
            }
            return freeze({
                contract: {arity: 2, args: 'same', result: 'core.decimal', contexts: ['projection', 'ordering']},
                descriptor: diagnostics.length ? undefined : {implementation: entry.implementation, operator, physical: entry.physical},
                diagnostics,
                requirements: [extensionCapability, 'postgresql.query.vectorDistance'],
            });
        };

        /**
         * @param {object} deps
         * @param {object} deps.base
         * @param {object} deps.connection
         * @param {object} deps.fingerprint
         * @param {string} deps.operation
         * @param {object} deps.requirements
         * @returns {Promise<any>}
         */
        this.preflight = async function ({base, connection, fingerprint, operation, requirements}) {
            const baseline = await base({connection, fingerprint, operation, requirements});
            const diagnostics = [...(baseline.diagnostics ?? [])];
            const available = new Set(baseline.availableCapabilities ?? []);
            const needsVector = requirements.some((item) => capabilities.includes(item));
            let installed = null;
            if (needsVector && diagnostics.length === 0) {
                const database = connection?.getClient?.() ?? connection?.getKnexTrx?.();
                try {
                    const row = await database('pg_extension').select('extversion').where({extname: 'vector'}).first();
                    installed = row?.extversion ?? null;
                } catch (error) {
                    diagnostics.push(diagnostic('DEM_CAPABILITY_UNAVAILABLE', 'pgvector extension capability could not be inspected.', {
                        capability: extensionCapability, reason: error instanceof Error ? error.message : String(error),
                    }));
                }
                if (!installed || !versionAtLeast(installed, '0.7.0')) {
                    diagnostics.push(diagnostic('DEM_CAPABILITY_UNAVAILABLE', 'pgvector 0.7.0 or newer is required and must be provisioned separately.', {
                        capability: extensionCapability, installed, minimum: '0.7.0',
                    }));
                }
                if (!installed || !versionAtLeast(installed, '0.7.0')) {
                    for (const item of requirements) if (capabilities.includes(item)) available.delete(item);
                }
            }
            return freeze({
                ...baseline,
                availableCapabilities: [...available].sort(),
                diagnostics,
                extensions: {vector: {installed, minimum: needsVector ? '0.7.0' : null}},
            });
        };

        /** @param {object} deps @param {object} deps.column @param {object} deps.value @returns {any} */
        this.encodeValue = function ({column, value}) {
            const type = column?.logicalType;
            if (type?.id !== 'core.vector') return value;
            if (value === null) return null;
            if (!validCanonical(type, value)) throw new TypeError('Value is not a canonical vector for the declared logical type.');
            if (type.params.element === 'bit') return value;
            if (type.params.sparse === true) {
                return `{${value.entries.map((entry) => `${entry.index}:${entry.value}`).join(',')}}/${value.dimensions}`;
            }
            return `[${value.join(',')}]`;
        };

        /** @param {object} deps @param {object} deps.column @param {object} deps.value @returns {any} */
        this.decodeValue = function ({column, value}) {
            const type = column?.logicalType;
            if (type?.id !== 'core.vector' || value === null) return value;
            if (type.params.element === 'bit') {
                if (!validCanonical(type, value)) throw new TypeError('Database bit vector is not canonical.');
                return value;
            }
            let decoded;
            if (type.params.sparse === true) {
                const match = /^\{(.*)\}\/(\d+)$/.exec(String(value));
                if (!match) throw new TypeError('Database sparse vector is malformed.');
                const entries = match[1] === '' ? [] : match[1].split(',').map((item) => {
                    const separator = item.indexOf(':');
                    return {index: Number(item.slice(0, separator)), value: Number(item.slice(separator + 1))};
                });
                decoded = {dimensions: Number(match[2]), entries};
            } else {
                const literal = String(value);
                if (!/^\[.*\]$/.test(literal)) throw new TypeError('Database dense vector is malformed.');
                decoded = literal.slice(1, -1) === '' ? [] : literal.slice(1, -1).split(',').map(Number);
            }
            if (!validCanonical(type, decoded)) throw new TypeError('Database vector is incompatible with the declared logical type.');
            return freeze(decoded);
        };

        /**
         * @param {object} deps
         * @param {object} deps.base
         * @param {object} deps.column
         * @param {object} deps.knex
         * @param {object} deps.tableBuilder
         * @returns {any}
         */
        this.addColumn = function ({base, column, knex, tableBuilder}) {
            const physical = column?.physicalType;
            if (!vectorTypes.has(physical?.type)) return base({column, knex, tableBuilder});
            const dimensions = physical.args?.[0];
            const rule = storageRules[physical.type];
            if (!integerInRange(dimensions, 1, rule.maxDimensions)) throw new TypeError('pgvector physical dimensions are invalid.');
            const builder = tableBuilder.specificType(column.name, `${physical.type}(${dimensions})`);
            if (column.comment) builder.comment(column.comment);
            column.nullable ? builder.nullable() : builder.notNullable();
            if (column.defaultValue !== undefined) {
                if (column.defaultValue.kind !== 'literal') throw new TypeError('pgvector columns accept only literal defaults.');
                builder.defaultTo(this.encodeValue({column, value: column.defaultValue.value}));
            }
            return builder;
        };

        /** @param {any} expression @param {any} knex @returns {any} */
        const compilePredicate = function (expression, knex) {
            if (expression.kind === 'attr') return knex.raw('??', [expression.name]);
            const args = expression.args.map((item) => compilePredicate(item, knex));
            switch (expression.operator) {
                case 'core.isNull': return knex.raw('? is null', [args[0]]);
                case 'core.notNull': return knex.raw('? is not null', [args[0]]);
                case 'core.not': return knex.raw('not (?)', [args[0]]);
                case 'core.and': return args.slice(1).reduce((left, right) => knex.raw('(? and ?)', [left, right]), args[0]);
                case 'core.or': return args.slice(1).reduce((left, right) => knex.raw('(? or ?)', [left, right]), args[0]);
                default: throw new TypeError('pgvector index predicate operator is not registered.');
            }
        };

        /**
         * @param {object} deps
         * @param {object} deps.base
         * @param {object} deps.connection
         * @param {object} deps.index
         * @param {object} deps.knex
         * @param {object} deps.table
         * @returns {Promise<void>}
         */
        this.addIndex = async function ({base, connection, index, knex, table}) {
            if (!['hnsw', 'ivfflat'].includes(index.method)) {
                await base({connection, index, knex, table});
                return;
            }
            const key = index.keys?.[0];
            const allowedClass = Object.values(operatorClasses).find((entry) => entry.physical === key?.operatorClass
                && entry.methods.includes(index.method));
            if (!allowedClass || index.keys.length !== 1) throw new TypeError('Unregistered pgvector physical index descriptor.');
            const optionRules = index.method === 'hnsw'
                ? {m: [2, 100], ef_construction: [4, 1000]} : {lists: [1, 32768]};
            for (const [name, value] of Object.entries(index.options ?? {})) {
                const range = optionRules[name];
                if (!range || !integerInRange(value, range[0], range[1])) {
                    throw new TypeError('Unregistered pgvector physical index option.');
                }
            }
            if (!validPredicate(index.predicate)) throw new TypeError('Unregistered pgvector physical index predicate.');
            let sql = `CREATE INDEX ?? ON ?? USING ${index.method} (?? ${allowedClass.physical})`;
            const bindings = [index.name, table.name, key.attr];
            const optionNames = index.method === 'hnsw' ? ['m', 'ef_construction'] : ['lists'];
            const options = optionNames.filter((name) => index.options[name] !== undefined);
            if (options.length) {
                sql += ` WITH (${options.map((name) => `${name} = ${index.options[name]}`).join(', ')})`;
            }
            if (index.predicate !== undefined) {
                sql += ' WHERE ?';
                bindings.push(compilePredicate(index.predicate, knex));
            }
            await knex.raw(sql, bindings);
        };

        /** @param {object} deps @param {object} deps.args @param {object} deps.descriptor @param {object} deps.knex @returns {any} */
        this.compileExpression = function ({args, descriptor, knex}) {
            const entry = operators[descriptor.operator];
            if (!entry || entry.physical !== descriptor.physical) return null;
            return knex.raw(`? ${entry.physical} ?`, args);
        };

        /**
         * @param {object} deps
         * @param {object} deps.execution
         * @param {object} deps.knex
         * @returns {Promise<void>}
         */
        this.applyExecutionOptions = async function ({execution, knex}) {
            const registry = {
                'postgresql.hnsw.ef_search': {maximum: 1000, minimum: 1, setting: 'hnsw.ef_search'},
                'postgresql.ivfflat.probes': {maximum: 32768, minimum: 1, setting: 'ivfflat.probes'},
            };
            const entries = Object.entries(execution ?? {}).sort(([left], [right]) => left.localeCompare(right));
            for (const [name, value] of entries) {
                const rule = registry[name];
                if (!rule) throw new TypeError(`Query execution option is not registered: '${name}'.`);
                if (!integerInRange(value, rule.minimum, rule.maximum)) {
                    throw new TypeError(`Query execution option '${name}' is outside its registered range.`);
                }
            }
            if (entries.length && knex?.isTransaction !== true) {
                throw new TypeError('PostgreSQL query execution options require one active transaction.');
            }
            for (const [name, value] of entries) {
                await knex.raw('select set_config(?, ?, true)', [registry[name].setting, String(value)]);
            }
        };

        Object.freeze(this);
    }
}
