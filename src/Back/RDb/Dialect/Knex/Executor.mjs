// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Knex_Executor
 * @description Safe Knex execution helpers for already resolved immutable physical descriptors.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Knex_Executor {
    /**
     * Initialize fixed execution allow-lists.
     */
    constructor() {
        /**
         * @param {object} deps
         * @param {object} deps.tableBuilder
         * @param {object} deps.column
         * @param {object} deps.knex
         * @returns {any}
         */
        this.addColumn = function ({tableBuilder, column, knex}) {
            const type = column.physicalType;
            const args = type.args ?? [];
            let builder;
            if (column.generation?.implementation === 'identity' && type.type !== 'increments') {
                builder = type.type === 'bigint'
                    ? tableBuilder.bigIncrements(column.name) : tableBuilder.increments(column.name);
            } else {
                switch (type.type) {
                    case 'binary':
                        builder = args[0] === undefined ? tableBuilder.binary(column.name) : tableBuilder.binary(column.name, args[0]);
                        break;
                    case 'boolean':
                        builder = tableBuilder.boolean(column.name);
                        break;
                    case 'date':
                        builder = tableBuilder.date(column.name);
                        break;
                    case 'datetime':
                        builder = tableBuilder.datetime(column.name, ...args);
                        break;
                    case 'decimal':
                        builder = tableBuilder.decimal(column.name, args[0], args[1]);
                        break;
                    case 'enum':
                        builder = tableBuilder.enum(column.name, args[0]);
                        break;
                    case 'increments':
                        builder = type.type === 'bigint'
                    ? tableBuilder.bigIncrements(column.name) : tableBuilder.increments(column.name);
                        break;
                    case 'integer':
                        builder = tableBuilder.integer(column.name);
                        break;
                    case 'json':
                        builder = tableBuilder.json(column.name);
                        break;
                    case 'jsonb':
                        builder = tableBuilder.jsonb(column.name);
                        break;
                    case 'smallint':
                        builder = tableBuilder.smallint(column.name);
                        break;
                    case 'string':
                        builder = args[0] === undefined ? tableBuilder.string(column.name) : tableBuilder.string(column.name, args[0]);
                        break;
                    case 'text':
                        builder = tableBuilder.text(column.name);
                        break;
                    case 'tinyint':
                        builder = tableBuilder.tinyint(column.name);
                        break;
                    case 'uuid':
                        builder = tableBuilder.uuid(column.name);
                        break;
                    case 'bigint':
                        builder = tableBuilder.bigInteger(column.name);
                        break;
                    default:
                        throw new TypeError(`Physical column executor is not registered for '${type.type}'.`);
                }
            }
            if (column.comment) builder.comment(column.comment);
            column.nullable ? builder.nullable() : builder.notNullable();
            if (column.defaultValue !== undefined) {
                if (column.defaultValue.kind === 'literal') {
                    builder.defaultTo(column.defaultValue.value);
                } else {
                    switch (column.defaultValue.implementation) {
                        case 'currentDate':
                        case 'currentTimestamp':
                            builder.defaultTo(knex.fn.now());
                            break;
                        default:
                            throw new TypeError(`Physical default executor is not registered for '${column.defaultValue.implementation}'.`);
                    }
                }
            }
            if (type.unsigned === true) builder.unsigned();
            return builder;
        };

        /**
         * @param {object} deps
         * @param {object} deps.tableBuilder
         * @param {object} deps.constraint
         */
        this.addConstraint = function ({tableBuilder, constraint}) {
            const columns = constraint.keys.map((item) => item.attr);
            switch (constraint.kind) {
                case 'primary':
                    tableBuilder.primary(columns, constraint.name);
                    break;
                case 'unique':
                    tableBuilder.unique(columns, constraint.name);
                    break;
                case 'index':
                    if (constraint.method !== 'index') throw new TypeError(`Index executor is not registered for '${constraint.method}'.`);
                    tableBuilder.index(columns, constraint.name);
                    break;
                default:
                    throw new TypeError(`Constraint executor is not registered for '${constraint.kind}'.`);
            }
        };

        /**
         * @param {object} deps
         * @param {object} deps.tableBuilder
         * @param {object} deps.relation
         */
        this.addRelation = function ({tableBuilder, relation}) {
            const builder = tableBuilder.foreign(relation.columns, relation.name)
                .references(relation.referencedColumns)
                .inTable(relation.referencedTable);
            if (relation.action?.delete) builder.onDelete(relation.action.delete.toUpperCase());
            if (relation.action?.update) builder.onUpdate(relation.action.update.toUpperCase());
            if (relation.deferrable && relation.deferrable !== 'notDeferrable') {
                builder.deferrable(relation.deferrable);
            }
        };

        /**
         * @param {object} deps
         * @param {object} deps.tableBuilder
         * @param {object} deps.index
         */
        this.addIndex = function ({tableBuilder, index}) {
            this.addConstraint({tableBuilder, constraint: index});
        };

        /**
         * @param {object} deps
         * @param {object} deps.tableBuilder
         * @param {object} deps.relation
         */
        this.dropRelation = function ({tableBuilder, relation}) {
            tableBuilder.dropForeign(relation.columns, relation.name);
        };

        /** @param {object} deps @param {object} deps.args @param {object} deps.descriptor @param {object} deps.knex @returns {any} */
        this.compileExpression = function ({args, descriptor, knex}) {
            switch (descriptor.implementation) {
                case 'and': return args.slice(1).reduce((left, right) => knex.raw('(? and ?)', [left, right]), args[0]);
                case 'or': return args.slice(1).reduce((left, right) => knex.raw('(? or ?)', [left, right]), args[0]);
                case 'not': return knex.raw('not (?)', [args[0]]);
                case 'eq': return knex.raw('? = ?', args);
                case 'notEq': return knex.raw('? <> ?', args);
                case 'gt': return knex.raw('? > ?', args);
                case 'gte': return knex.raw('? >= ?', args);
                case 'lt': return knex.raw('? < ?', args);
                case 'lte': return knex.raw('? <= ?', args);
                case 'isNull': return knex.raw('? is null', [args[0]]);
                case 'notNull': return knex.raw('? is not null', [args[0]]);
                case 'lower': return knex.raw('lower(?)', [args[0]]);
                default: throw new TypeError("Expression executor is not registered for '" + descriptor.implementation + "'.");
            }
        };

        Object.freeze(this);
    }
}
