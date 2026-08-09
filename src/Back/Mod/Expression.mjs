// @ts-check

/**
 * @namespace TeqFw_Db_Back_Mod_Expression
 * @description Type-checks and compiles registered query expressions to bound Knex expressions.
 */

export default class TeqFw_Db_Back_Mod_Expression {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Registry_Core} deps.core
     * @param {TeqFw_Db_Back_Dem_Registry_CoreValue} deps.coreValue
     * @param {TeqFw_Db_Shared_Dto_Query_Expression.Factory} deps.expressionFactory
     */
    constructor({core, coreValue, expressionFactory}) {
        /** @param {any} value @returns {any} */
        const normalize = function (value) {
            if (Array.isArray(value)) return value.map(normalize);
            if (value && typeof value === 'object') {
                const result = {};
                for (const key of Object.keys(value).sort()) result[key] = normalize(value[key]);
                return result;
            }
            return value;
        };
        /** @param {object} type @returns {string} */
        const signature = (type) => JSON.stringify(normalize({id: type.id, params: type.params ?? {}}));


        /**
         * @param {string} code
         * @param {string} message
         * @param {object} details
         * @param {string} path
         * @returns {Error}
         */
        const failure = function (code, message, details, path) {
            const diagnostic = Object.freeze({code, details: Object.freeze({...details}), message, path, severity: 'error', stage: 'query'});
            const error = new Error(message);
            error.name = 'ExpressionCompilationError';
            Object.defineProperty(error, 'diagnostics', {enumerable: true, value: Object.freeze([diagnostic])});
            return Object.freeze(error);
        };

        /**
         * @param {object} deps
         * @param {object} deps.expression
         * @param {object} deps.entitySchema
         * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.adapter
         * @param {'filter'|'projection'|'ordering'|'index'|'predicate'} deps.context
         * @param {Knex} deps.knex
         * @returns {Promise<object>}
         */
        this.exec = async function ({expression, entitySchema, adapter, context, knex}) {
            const root = expressionFactory.create(expression);
            const requirements = new Set();
            const allowAny = entitySchema?.compatibilityUntyped === true;

            /** @param {string} name @returns {object|null} */
            const findAttr = function (name) {
                const raw = entitySchema?.attr?.[name] ?? entitySchema?.columns?.find?.((item) => item.name === name);
                if (!raw) return null;
                const mapped = typeof entitySchema.mapColumn === 'function' ? entitySchema.mapColumn(name) : (raw.column ?? raw.name ?? name);
                if (typeof mapped !== 'string' || !mapped) return null;
                const type = coreValue.normalizeType({allowAny, type: raw.type ?? raw.logicalType});
                return {column: mapped, type};
            };

            /** @param {object} node @returns {object|null} */
            const infer = function (node) {
                if (node.kind === 'attr') return findAttr(node.name)?.type ?? null;
                if (node.kind === 'value' && node.type) return coreValue.normalizeType({allowAny: false, type: node.type});
                return null;
            };

            /**
             * @param {object} node
             * @param {string} path
             * @param {object|null} expected
             * @returns {Promise<object>}
             */
            const compileNode = async function (node, path, expected = null) {
                if (node.kind === 'attr') {
                    const attr = findAttr(node.name);
                    if (!attr) throw failure('DEM_EXPRESSION_INVALID', 'Query expression references an unknown attribute.', {attribute: node.name}, path);
                    if (!attr.type) throw failure('DEM_EXPRESSION_INVALID', 'Query schema attribute has no valid registered logical type.', {attribute: node.name}, path);
                    return {expression: knex.raw('??', [attr.column]), logicalType: attr.type};
                }
                if (node.kind === 'value') {
                    const declared = node.type !== undefined;
                    const type = declared ? coreValue.normalizeType({allowAny: false, type: node.type}) : expected;
                    if (!type) throw failure('DEM_EXPRESSION_INVALID', 'Untyped query value cannot be inferred or its declared type is invalid.', {}, path);
                    if (type.id === 'core.any' && (!allowAny || declared)
                        || !coreValue.matches({allowAny: allowAny && !declared, type, value: node.value})) {
                        throw failure('DEM_EXPRESSION_INVALID', 'Query value is incompatible with its logical type.', {type: type.id}, path);
                    }
                    const encoded = adapter.encodeValue({column: {logicalType: type}, value: node.value});
                    return {expression: knex.raw('?', [encoded]), logicalType: type};
                }

                let resolution = await adapter.resolveOperator({context, location: path, operator: node.operator});
                const contract = core.operators[node.operator] ?? resolution?.contract;
                if (!contract || !resolution?.descriptor) {
                    throw failure('DEM_EXPRESSION_INVALID', 'Query operator is not registered by the selected adapter.', {operator: node.operator}, path);
                }
                if (!contract.contexts.includes(context)) {
                    throw failure('DEM_EXPRESSION_INVALID', 'Query operator is forbidden in this context.', {context, operator: node.operator}, path);
                }
                const arity = contract.arity;
                const arityValid = typeof arity === 'number' ? node.args.length === arity : node.args.length >= arity.min;
                if (!arityValid) throw failure('DEM_EXPRESSION_INVALID', 'Query operator has invalid arity.', {arity: node.args.length, operator: node.operator}, path);

                let expectedType = null;
                if (contract.args === 'same' || contract.args === 'orderedSame') {
                    expectedType = node.args.map(infer).find(Boolean) ?? null;
                }
                const args = [];
                for (let index = 0; index < node.args.length; index++) {
                    args.push(await compileNode(node.args[index], `${path}/args/${index}`, expectedType));
                    expectedType ??= args[index].logicalType;
                }
                const types = args.map((item) => item.logicalType);
                let typesValid = true;
                if (contract.args === 'boolean') typesValid = types.every((type) => type.id === 'core.boolean');
                if (contract.args === 'same' || contract.args === 'orderedSame') {
                    typesValid = types.every((type) => signature(type) === signature(types[0]));
                    if (typesValid && contract.args === 'orderedSame') {
                        typesValid = types.every((type) => (allowAny && type.id === 'core.any') || ['core.date', 'core.datetime', 'core.decimal', 'core.integer', 'core.string', 'core.text'].includes(type.id));
                    }
                }
                if (Array.isArray(contract.args)) typesValid = types.every((type) => contract.args.includes(type.id));
                if (!typesValid) {
                    throw failure('DEM_EXPRESSION_INVALID', 'Query operator argument types are incompatible.', {operator: node.operator, types: types.map((type) => type.id)}, path);
                }
                resolution = await adapter.resolveOperator({
                    argumentTypes: types, context, location: path, operator: node.operator,
                });
                if (!resolution?.descriptor || resolution.diagnostics?.length) {
                    throw failure('DEM_EXPRESSION_INVALID', 'Query operator does not accept the resolved argument types.', {
                        operator: node.operator, types: types.map((type) => type.id),
                    }, path);
                }
                for (const capability of resolution.requirements ?? []) requirements.add(capability);
                const logicalType = contract.result === 'same' ? types[0] : {id: contract.result, params: {}};
                const knexExpression = adapter.compileExpression({
                    args: args.map((item) => item.expression), descriptor: resolution.descriptor, knex,
                });
                return {expression: knexExpression, logicalType};
            };

            const compiled = await compileNode(root, '', null);
            return Object.freeze({
                knexExpression: compiled.expression,
                logicalType: Object.freeze(structuredClone(compiled.logicalType)),
                requirements: Object.freeze([...requirements].sort()),
            });
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        core: 'TeqFw_Db_Back_Dem_Registry_Core$',
        coreValue: 'TeqFw_Db_Back_Dem_Registry_CoreValue$',
        expressionFactory: 'TeqFw_Db_Shared_Dto_Query_Expression__Factory$',
    }),
});
