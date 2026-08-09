// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Knex
 * @description Builds frozen registry-backed adapters without making dialect decisions.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Knex {
    /**
     * Initialize shared safe adapter helpers.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Dialect_Knex_Executor} deps.executor
     */
    constructor({executor}) {
        /**
         * @param {any} value
         * @returns {any}
         */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        /**
         * @param {object} deps
         * @param {object} deps.description
         * @param {object} deps.types
         * @param {object} deps.storage
         * @param {object} deps.indexes
         * @param {object} deps.defaults
         * @param {object} deps.generations
         * @returns {object}
         */
        this.createAdapter = function ({description, types, storage, indexes, defaults, generations}) {
            const frozenDescription = freeze(structuredClone(description));
            const typeRegistry = freeze({...types});
            const storageRegistry = freeze({...storage});
            const indexRegistry = freeze({...indexes});
            const defaultRegistry = freeze({...defaults});
            const generationRegistry = freeze({...generations});
            const adapter = {};

            adapter.describe = async function () {
                return frozenDescription;
            };
            adapter.resolveType = async function ({compatibility, logicalType, storage: binding}) {
                const compatibilityKey = compatibility?.physical ? `legacy.${compatibility.physical}` : null;
                const entry = binding ? storageRegistry[binding.type]
                    : compatibilityKey ? typeRegistry[compatibilityKey] : typeRegistry[logicalType.id];
                if (!entry) {
                    return {
                        diagnostics: [{
                            code: binding ? 'DEM_STORAGE_UNSUPPORTED' : 'DEM_STORAGE_AMBIGUOUS',
                            details: {adapter: frozenDescription.id, storage: binding?.type, type: logicalType.id},
                            message: 'The selected adapter has no registered physical storage mapping.',
                        }],
                        requirements: [],
                    };
                }
                if (binding && Array.isArray(entry.bindingParams)) {
                    const params = binding.params;
                    const validParams = params && typeof params === 'object' && !Array.isArray(params)
                        && Object.keys(params).every((name) => entry.bindingParams.includes(name));
                    if (!validParams) {
                        return {
                            diagnostics: [{
                                code: 'DEM_STORAGE_UNSUPPORTED',
                                details: {adapter: frozenDescription.id, params, storage: binding.type},
                                message: 'Storage binding parameters do not match the closed adapter registry entry.',
                            }],
                            requirements: [],
                        };
                    }
                }
                const projected = entry.project({binding, compatibility, logicalType});
                return {
                    compatibilitySignature: projected.compatibilitySignature ?? JSON.stringify(projected.physicalType),
                    diagnostics: projected.diagnostics ?? [],
                    physicalType: projected.physicalType,
                    requirements: [...new Set(entry.requirements ?? [])].sort(),
                };
            };
            adapter.resolveDefault = async function ({defaultValue, logicalType}) {
                if (defaultValue.kind === 'literal') {
                    return {descriptor: structuredClone(defaultValue), diagnostics: [], requirements: []};
                }
                const entry = defaultRegistry[defaultValue.name];
                if (!entry || !entry.types.includes(logicalType.id)) {
                    return {
                        diagnostics: [{
                            code: 'DEM_DEFAULT_INVALID',
                            details: {adapter: frozenDescription.id, name: defaultValue.name},
                            message: 'The selected adapter cannot project the registered default function.',
                        }],
                        requirements: [],
                    };
                }
                return {
                    descriptor: {kind: 'function', implementation: entry.implementation, name: defaultValue.name},
                    diagnostics: [],
                    requirements: [...new Set(entry.requirements ?? [])].sort(),
                };
            };
            adapter.resolveGeneration = async function ({generation, logicalType}) {
                const entry = generationRegistry[generation.kind];
                if (!entry || !entry.types.includes(logicalType.id)
                    || Array.isArray(entry.bits) && !entry.bits.includes(logicalType.params?.bits)
                    || Array.isArray(entry.modes) && !entry.modes.includes(generation.params?.mode)) {
                    return {
                        diagnostics: [{
                            code: 'DEM_GENERATION_INVALID',
                            details: {adapter: frozenDescription.id, kind: generation.kind},
                            message: 'The selected adapter cannot project the registered generation policy.',
                        }],
                        requirements: [],
                    };
                }
                return {
                    descriptor: {implementation: entry.implementation, kind: generation.kind, params: structuredClone(generation.params)},
                    diagnostics: [],
                    requirements: [...new Set(entry.requirements ?? [])].sort(),
                };
            };
            adapter.resolveIndex = async function ({entity, index, physicalName}) {
                if (index.kind === 'primary' || index.kind === 'unique') {
                    const valid = index.phase === 'table' && index.method === undefined
                        && index.predicate === undefined && (index.include?.length ?? 0) === 0
                        && Object.keys(index.options ?? {}).length === 0
                        && index.keys.every((key) => typeof key.attr === 'string'
                            && Object.keys(key).every((name) => name === 'attr'));
                    if (!valid) {
                        return {
                            diagnostics: [{
                                code: 'DEM_INDEX_INVALID',
                                details: {adapter: frozenDescription.id, kind: index.kind},
                                message: 'Key constraints accept only direct attributes in the table phase.',
                            }],
                            requirements: [],
                        };
                    }
                    return {
                        descriptor: {
                            include: [],
                            keys: structuredClone(index.keys),
                            kind: index.kind,
                            name: physicalName,
                            options: {},
                        },
                        diagnostics: [],
                        requirements: [],
                    };
                }
                const entry = indexRegistry[index.method];
                if (!entry) {
                    return {
                        diagnostics: [{
                            code: 'DEM_INDEX_INVALID',
                            details: {adapter: frozenDescription.id, method: index.method},
                            message: 'The selected adapter has no registered index method.',
                        }],
                        requirements: [],
                    };
                }
                if (index.method === 'core.btree') {
                    const valid = index.keys.every((key) => typeof key.attr === 'string'
                            && Object.keys(key).every((name) => name === 'attr'))
                        && index.predicate === undefined && (index.include?.length ?? 0) === 0
                        && Object.keys(index.options ?? {}).length === 0;
                    if (!valid) {
                        return {
                            diagnostics: [{
                                code: 'DEM_INDEX_INVALID',
                                details: {adapter: frozenDescription.id, method: index.method},
                                message: 'The portable B-tree registry supports direct keys without provider-only options.',
                            }],
                            requirements: [],
                        };
                    }
                }
                const value = entry.project({entity, index, physicalName});
                return {
                    descriptor: value.descriptor,
                    diagnostics: value.diagnostics ?? [],
                    requirements: [...new Set(entry.requirements ?? [])].sort(),
                };
            };
            adapter.resolveOperator = async function ({operator}) {
                const contracts = {
                    'core.and': {arity: {min: 2}, args: 'boolean', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.eq': {arity: 2, args: 'same', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.gte': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.gt': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.isNull': {arity: 1, args: 'any', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.lower': {arity: 1, args: ['core.string', 'core.text'], result: 'same', contexts: ['filter', 'projection', 'ordering', 'index', 'predicate']},
                    'core.lte': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.lt': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.not': {arity: 1, args: 'boolean', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.notEq': {arity: 2, args: 'same', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.notNull': {arity: 1, args: 'any', result: 'core.boolean', contexts: ['filter', 'predicate']},
                    'core.or': {arity: {min: 2}, args: 'boolean', result: 'core.boolean', contexts: ['filter', 'predicate']},
                };
                const contract = contracts[operator];
                return contract ? {contract, descriptor: {implementation: operator.slice(5), operator}, diagnostics: [], requirements: [frozenDescription.id + '.core']}
                    : {diagnostics: [{code: 'DEM_EXPRESSION_INVALID', details: {operator}, message: 'The selected adapter has no registered query operator.'}], requirements: []};
            };

            adapter.resolveRelation = async function ({relation}) {
                return {descriptor: structuredClone(relation), diagnostics: [], requirements: []};
            };
            adapter.preflight = async function ({connection, fingerprint, operation, requirements}) {
                const supported = new Set(frozenDescription.supportedCapabilities);
                const client = (connection?.getKnex?.() ?? connection?.getKnexTrx?.())?.client?.config?.client;
                const identityMatches = frozenDescription.clients.includes(client);
                const unavailable = requirements.filter((item) => !supported.has(item) || !identityMatches);
                return freeze({
                    adapter: frozenDescription.id,
                    availableCapabilities: requirements.filter((item) => supported.has(item) && identityMatches).sort(),
                    client,
                    fingerprint,
                    operation,
                    diagnostics: unavailable.map((capability) => ({
                        code: 'DEM_CAPABILITY_UNAVAILABLE',
                        details: {capability, client, expectedClients: frozenDescription.clients},
                        message: 'A required runtime capability is unavailable.',
                    })),
                });
            };
            adapter.encodeValue = function ({column, value}) {
                if (value === null || value === undefined) return value;
                const type = column?.logicalType?.id;
                if (type === 'core.date' && value instanceof Date) return value.toISOString().slice(0, 10);
                if (type === 'core.datetime' && value instanceof Date) return value.toISOString();
                return value;
            };
            adapter.decodeValue = function ({column, value}) {
                if (value === null || value === undefined) return value;
                const type = column?.logicalType?.id;
                if (type === 'core.date') {
                    if (value instanceof Date) return value.toISOString().slice(0, 10);
                    const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
                    return match ? match[1] : value;
                }
                if (type === 'core.datetime' && value instanceof Date) return value.toISOString();
                if (type === 'core.boolean' && (value === 0 || value === 1)) return value === 1;
                if (type === 'core.integer' && typeof value === 'string' && /^-?\d+$/.test(value)) {
                    const parsed = Number(value);
                    return Number.isSafeInteger(parsed) ? parsed : value;
                }
                if (type === 'core.json' && typeof value === 'string') {
                    try { return JSON.parse(value); } catch { return value; }
                }
                return value;
            };
            adapter.addColumn = executor.addColumn;
            adapter.addConstraint = executor.addConstraint;
            adapter.addRelation = executor.addRelation;
            adapter.addIndex = async function ({connection, index, knex, table}) {
                await connection.getSchemaBuilder().alterTable(table.name, (tableBuilder) => {
                    executor.addIndex({index, knex, tableBuilder});
                });
            };
            adapter.dropRelation = executor.dropRelation;
            adapter.compileExpression = executor.compileExpression;
            adapter.prepareTransfer = async function () {
                return freeze({strategy: null});
            };
            adapter.restoreGeneratedState = async function () {
                return freeze([]);
            };
            adapter.applyExecutionOptions = async function ({execution}) {
                const keys = Object.keys(execution ?? {});
                if (keys.length) throw new TypeError("Query execution option is not registered: '" + keys.sort()[0] + "'.");
            };
            adapter.validateCycleStrategy = function () {
                return freeze({diagnostics: [], requirements: [], valid: false});
            };
            return freeze(adapter);
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        executor: 'TeqFw_Db_Back_RDb_Dialect_Knex_Executor$',
    }),
});
