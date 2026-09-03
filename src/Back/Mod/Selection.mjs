// @ts-check

/**
 * @namespace TeqFw_Db_Back_Mod_Selection
 * @description Applies Selection v2 through one typed expression compiler.
 */

export default class TeqFw_Db_Back_Mod_Selection {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Mod_Expression} deps.expression
     * @param {TeqFw_Db_Shared_Dto_Query_Selection__Factory} deps.selectionFactory
     */
    constructor({expression, selectionFactory}) {

        /**
         * @param {any} meta
         * @returns {any}
         */
        const adaptEntitySchema = function (meta) {
            if (meta?.attr || meta?.columns) {
                const values = meta.attr ? Object.values(meta.attr) : meta.columns;
                if (values.some((item) => !(item?.type ?? item?.logicalType))) {
                    throw new TypeError('Selection v2 requires registered logical types for every schema attribute.');
                }
                return meta;
            }
            const attributes = typeof meta?.getAttributes === 'function' ? meta.getAttributes() : {};
            const logicalTypes = typeof meta?.getLogicalTypes === 'function' ? meta.getLogicalTypes() : null;
            if (!logicalTypes || typeof logicalTypes !== 'object' || Array.isArray(logicalTypes)) {
                throw new TypeError('Selection v2 requires schema.getLogicalTypes().');
            }
            const attr = {};
            for (const [key, name] of Object.entries(attributes ?? {})) {
                const type = logicalTypes?.[name] ?? logicalTypes?.[key]
                    ?? undefined;
                if (!type) throw new TypeError("Selection v2 has no logical type for attribute '" + name + "'.");
                attr[name] = {name, type};
            }
            return {
                attr,
                mapColumn: (name) => typeof meta?.mapColumn === 'function' ? meta.mapColumn(name) : (attr[name] ? name : undefined),
            };
        };

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {any} meta
         * @param {any} query
         * @param {any} selection
         * @param {boolean} count
         * @returns {Promise<any>}
         */
        const populate = async function (trx, meta, query, selection, count) {
            const decoded = selectionFactory.create(selection);
            const adapter = trx.getDialectAdapter();
            const knex = trx.getKnexTrx();
            const entitySchema = adaptEntitySchema(meta);
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
         * @param {any} query
         * @param {any} selection
         * @returns {Promise<any>}
         */
        this.populate = function (trx, meta, query, selection) {
            return populate(trx, meta, query, selection, false);
        };

        /**
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {any} meta
         * @param {any} query
         * @param {any} selection
         * @returns {Promise<any>}
         */
        this.populateCount = function (trx, meta, query, selection) {
            return populate(trx, meta, query, selection, true);
        };

    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        expression: 'TeqFw_Db_Back_Mod_Expression$',
        selectionFactory: 'TeqFw_Db_Shared_Dto_Query_Selection__Factory$',
    }),
});
