// @ts-check

/**
 * @namespace TeqFw_Db_Back_Mod_Selection
 * @description Decodes legacy selections and applies Selection v2 through one typed expression compiler.
 */

export default class TeqFw_Db_Back_Mod_Selection {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Mod_Expression} deps.expression
     * @param {TeqFw_Db_Shared_Dto_Query_Selection.Factory} deps.selectionFactory
     * @param {TeqFw_Db_Shared_Dto_List_Selection} deps.legacySelection
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond} deps.legacyCondition
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Cond} deps.COND
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Func} deps.FUNC
     */
    constructor({expression, selectionFactory, legacySelection, legacyCondition, COND, FUNC}) {
        const functions = Object.freeze({
            [FUNC.EQ]: 'core.eq',
            [FUNC.GT]: 'core.gt',
            [FUNC.GTE]: 'core.gte',
            [FUNC.LT]: 'core.lt',
            [FUNC.LTE]: 'core.lte',
            [FUNC.NOT_EQ]: 'core.notEq',
            [FUNC.NULL]: 'core.isNull',
            [FUNC.NOT_NULL]: 'core.notNull',
        });
        const conditions = Object.freeze({
            [COND.AND]: 'core.and',
            [COND.NOT]: 'core.not',
            [COND.OR]: 'core.or',
        });

        /**
         * @param {any} node
         * @returns {object}
         */
        const decodeLegacyExpression = function (node) {
            if (!node || typeof node !== 'object') throw new TypeError('Legacy selection expression must be an object.');
            if (typeof node.with === 'string') {
                const operator = conditions[node.with];
                if (!operator || !Array.isArray(node.items)) throw new TypeError(`Unsupported legacy condition '${node.with}'.`);
                return {kind: 'call', operator, args: node.items.map(decodeLegacyExpression)};
            }
            const operator = functions[node.name];
            if (!operator || !Array.isArray(node.params)) throw new TypeError(`Unsupported legacy filter function '${node.name}'.`);
            const args = node.params.map((param) => {
                if (param && Object.prototype.hasOwnProperty.call(param, 'alias')) {
                    return {kind: 'attr', name: param.alias};
                }
                if (param && Object.prototype.hasOwnProperty.call(param, 'value')) {
                    return {kind: 'value', value: param.value};
                }
                return decodeLegacyExpression(param);
            });
            return {kind: 'call', operator, args};
        };

        /**
         * @param {any} selection
         * @returns {object}
         */
        const decode = function (selection) {
            if (selection?.version === 2) return selectionFactory.create(selection);
            const value = {
                version: 2,
                execution: {},
                limit: Number.isInteger(selection?.rowsLimit) && selection.rowsLimit > 0 ? selection.rowsLimit : 0,
                offset: Number.isInteger(selection?.rowsOffset) && selection.rowsOffset > 0 ? selection.rowsOffset : 0,
                orderBy: Array.isArray(selection?.orderBy) ? selection.orderBy.map((item) => ({
                    direction: item.dir,
                    expression: {kind: 'attr', name: item.alias},
                })) : [],
                select: [],
            };
            if (selection?.filter) value.where = decodeLegacyExpression(selection.filter);
            return selectionFactory.create(value);
        };

        /**
         * @param {any} meta
         * @param {boolean} allowUntyped
         * @returns {object}
         */
        const adaptEntitySchema = function (meta, allowUntyped) {
            if (meta?.attr || meta?.columns) {
                const values = meta.attr ? Object.values(meta.attr) : meta.columns;
                if (!allowUntyped && values.some((item) => !(item?.type ?? item?.logicalType))) {
                    throw new TypeError('Selection v2 requires registered logical types for every schema attribute.');
                }
                return {...meta, compatibilityUntyped: allowUntyped === true};
            }
            const attributes = typeof meta?.getAttributes === 'function' ? meta.getAttributes() : {};
            const logicalTypes = typeof meta?.getLogicalTypes === 'function' ? meta.getLogicalTypes() : null;
            if (!allowUntyped && (!logicalTypes || typeof logicalTypes !== 'object' || Array.isArray(logicalTypes))) {
                throw new TypeError('Selection v2 requires schema.getLogicalTypes().');
            }
            const attr = {};
            for (const [key, name] of Object.entries(attributes ?? {})) {
                const type = logicalTypes?.[name] ?? logicalTypes?.[key]
                    ?? (allowUntyped ? {id: 'core.any', params: {}} : undefined);
                if (!type) throw new TypeError("Selection v2 has no logical type for attribute '" + name + "'.");
                attr[name] = {name, type};
            }
            return {
                attr,
                compatibilityUntyped: allowUntyped === true,
                mapColumn: (name) => typeof meta?.mapColumn === 'function' ? meta.mapColumn(name) : (attr[name] ? name : undefined),
            };
        };

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {any} meta
         * @param {Knex.QueryBuilder} query
         * @param {any} selection
         * @param {boolean} count
         * @returns {Promise<object>}
         */
        const populate = async function (trx, meta, query, selection, count) {
            const legacy = selection?.version !== 2;
            const decoded = decode(selection);
            const adapter = trx.getDialectAdapter();
            const knex = trx.getKnexTrx();
            const entitySchema = adaptEntitySchema(meta, legacy);
            const requirements = new Set();
            let where;
            if (decoded.where) {
                where = await expression.exec({adapter, context: 'filter', entitySchema, expression: decoded.where, knex});
                if (where.logicalType.id !== 'core.boolean') throw new TypeError('Selection where expression must return core.boolean.');
                for (const item of where.requirements) requirements.add(item);
            }
            const selected = [];
            const ordered = [];
            if (!count) {
                const baseAliases = new Set(Object.keys(entitySchema.attr ?? {}));
                for (const item of decoded.select) {
                    if (baseAliases.has(item.as)) {
                        throw new TypeError("Derived selection alias '" + item.as + "' conflicts with a base attribute.");
                    }
                    const compiled = await expression.exec({
                        adapter, context: 'projection', entitySchema, expression: item.expression, knex,
                    });
                    for (const requirement of compiled.requirements) requirements.add(requirement);
                    selected.push({as: item.as, compiled});
                }
                for (const item of decoded.orderBy) {
                    const compiled = await expression.exec({
                        adapter, context: 'ordering', entitySchema, expression: item.expression, knex,
                    });
                    for (const requirement of compiled.requirements) requirements.add(requirement);
                    ordered.push({compiled, direction: item.direction, source: item.expression});
                }
                const nearest = ordered.filter((item) => item.source.kind === 'call'
                    && item.source.operator.startsWith('postgresql.pgvector.') && item.source.operator.endsWith('Distance'));
                if (nearest.length > 0 && (decoded.limit <= 0 || nearest.some((item) => item.direction !== 'asc'))) {
                    throw new TypeError('Nearest-neighbour distance ordering requires ascending direction and a positive limit.');
                }
            }
            const preflight = await adapter.preflight({
                connection: trx,
                fingerprint: null,
                operation: 'query',
                requirements: [...requirements].sort(),
            });
            if (preflight.diagnostics?.length) {
                const error = new Error('Query capability preflight failed.');
                error.name = 'DemPreflightError';
                Object.defineProperty(error, 'evidence', {enumerable: true, value: preflight});
                throw Object.freeze(error);
            }
            if (!count) await adapter.applyExecutionOptions({execution: decoded.execution, knex, transaction: trx});

            if (where) query.where(where.knexExpression);
            if (!count) {
                for (const item of selected) query.select({[item.as]: item.compiled.knexExpression});
                for (const item of ordered) query.orderBy(item.compiled.knexExpression, item.direction);
                if (decoded.limit > 0) query.limit(decoded.limit);
                if (decoded.offset > 0) query.offset(decoded.offset);
            }
            return Object.freeze({decoded, preflight, requirements: Object.freeze([...requirements].sort())});
        };

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {any} meta
         * @param {Knex.QueryBuilder} query
         * @param {any} selection
         * @returns {Promise<object>}
         */
        this.populate = function (trx, meta, query, selection) {
            return populate(trx, meta, query, selection, false);
        };

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {any} meta
         * @param {Knex.QueryBuilder} query
         * @param {any} selection
         * @returns {Promise<object>}
         */
        this.populateCount = function (trx, meta, query, selection) {
            return populate(trx, meta, query, selection, true);
        };

        /**
         * @param {any} selection
         * @returns {any}
         */
        this.wrapSelectionAnd = function (selection) {
            if (selection?.version === 2) return structuredClone(selection);
            const result = legacySelection.createDto(selection);
            const wrapper = legacyCondition.createDto();
            wrapper.with = COND.AND;
            wrapper.items = [selection.filter];
            result.filter = wrapper;
            return result;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        expression: 'TeqFw_Db_Back_Mod_Expression$',
        selectionFactory: 'TeqFw_Db_Shared_Dto_Query_Selection__Factory$',
        legacySelection: 'TeqFw_Db_Shared_Dto_List_Selection$',
        legacyCondition: 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond$',
        COND: 'TeqFw_Db_Shared_Enum_Filter_Cond__default',
        FUNC: 'TeqFw_Db_Shared_Enum_Filter_Func__default',
    }),
});
