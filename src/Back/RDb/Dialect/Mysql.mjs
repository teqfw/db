// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Mysql
 * @description MySQL and MariaDB physical projection adapter with explicit frozen registries.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Mysql {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Dialect_Knex} deps.knex
     */
    constructor({knex}) {
        const capability = 'mysql.core';
        /** @param {any} type @param {any} args @param {any} unsigned @param {any} validate @returns {any} */
        const entry = function (type, args = () => [], unsigned = () => false, validate = () => []) {
            return {
                bindingParams: [],
                requirements: [capability],
                project: function ({logicalType}) {
                    const diagnostics = validate(logicalType);
                    const physicalType = typeof type === 'function' ? type(logicalType) : type;
                    return {
                        diagnostics,
                        physicalType: diagnostics.length ? undefined : {
                            dialect: 'mysql', type: physicalType, args: args(logicalType), unsigned: unsigned(logicalType),
                        },
                    };
                },
            };
        };
        const types = {
            'core.binary': entry('binary', (type) => type.params.length ? [type.params.length] : []),
            'core.boolean': entry('boolean'),
            'core.date': entry('date'),
            'core.datetime': entry('datetime', (type) => [{precision: type.params.precision, useTz: type.params.timezone}]),
            'core.decimal': entry('decimal', (type) => [type.params.precision, type.params.scale], (type) => type.params.unsigned),
            'core.enum': entry('enum', (type) => [type.params.values]),
            'core.integer': entry((type) => ({8: 'tinyint', 16: 'smallint', 32: 'integer', 64: 'bigint'}[type.params.bits]), () => [], (type) => type.params.unsigned),
            'core.json': entry('jsonb'),
            'core.string': entry('string', (type) => [type.params.length]),
            'core.text': entry('text'),
            'core.uuid': entry('uuid'),
        };
        const storage = {
            binary: types['core.binary'],
            boolean: types['core.boolean'],
            date: types['core.date'],
            datetime: types['core.datetime'],
            decimal: types['core.decimal'],
            enum: types['core.enum'],
            integer: types['core.integer'],
            json: entry('json'),
            jsonb: entry('jsonb'),
            string: types['core.string'],
            text: types['core.text'],
            uuid: types['core.uuid'],
        };
        const indexes = {
            'core.btree': {
                requirements: [capability],
                project: function ({index, physicalName}) {
                    return {
                        descriptor: {
                            include: [], keys: structuredClone(index.keys), kind: index.kind, method: 'index',
                            name: physicalName, options: {},
                        },
                    };
                },
            },
        };
        const adapter = knex.createAdapter({
            description: {
                id: 'mysql',
                clients: ['mariadb', 'mysql', 'mysql2'],
                registryVersions: {core: 1},
                supportedCapabilities: [capability],
            },
            defaults: {
                'core.currentDate': {implementation: 'currentDate', requirements: [capability], types: ['core.date']},
                'core.currentTimestamp': {implementation: 'currentTimestamp', requirements: [capability], types: ['core.datetime']},
            },
            generations: {
                'core.identity': {
                    implementation: 'identity',
                    modes: ['byDefault'],
                    bits: [32, 64],
                    requirements: [capability],
                    types: ['core.integer'],
                },
            },
            indexes,
            storage,
            types,
        });
        Object.assign(this, adapter);
        const baseDecodeValue = this.decodeValue;
        const baseEncodeValue = this.encodeValue;
        /** @param {number} value @param {number} length @returns {string} */
        const pad = (value, length = 2) => String(value).padStart(length, '0');
        /** @param {any} value @returns {string} */
        const localDate = function (value) {
            return `${pad(value.getFullYear(), 4)}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
        };
        /** @param {any} value @param {any} separator @returns {string} */
        const localDateTime = function (value, separator) {
            return `${localDate(value)}${separator}${pad(value.getHours())}:${pad(value.getMinutes())}`
                + `:${pad(value.getSeconds())}.${pad(value.getMilliseconds(), 3)}`;
        };
        /** @param {string} value @param {any} separator @returns {string} */
        const normalizeDateTime = function (value, separator) {
            const plain = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?)$/.exec(value);
            if (plain) return `${plain[1]}${separator}${plain[2]}`;
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? value : localDateTime(parsed, separator);
        };
        /** @param {any} args @returns {any} */
        this.decodeValue = function (args) {
            const type = args.column?.logicalType?.id;
            if (args.value instanceof Date) {
                if (type === 'core.date') return localDate(args.value);
                if (type === 'core.datetime') return localDateTime(args.value, 'T');
            }
            if (type === 'core.datetime' && typeof args.value === 'string') {
                return normalizeDateTime(args.value, 'T');
            }
            return baseDecodeValue(args);
        };
        /** @param {any} args @returns {any} */
        this.encodeValue = function (args) {
            const type = args.column?.logicalType?.id;
            if (args.value instanceof Date) {
                if (type === 'core.date') return localDate(args.value);
                if (type === 'core.datetime') return localDateTime(args.value, ' ');
            }
            if (type === 'core.datetime' && typeof args.value === 'string') {
                return normalizeDateTime(args.value, ' ');
            }
            return baseEncodeValue(args);
        };
        const baseAddColumn = this.addColumn;
        /** @param {any} args @returns {any} */
        this.addColumn = function (args) {
            const {column, tableBuilder} = args;
            if (column.generation?.implementation !== 'identity' || column.physicalType.type === 'increments') {
                return baseAddColumn(args);
            }
            const identityTypes = Object.freeze({bigint: 'bigint', integer: 'int'});
            const type = identityTypes[column.physicalType.type];
            if (!type) {
                throw new TypeError(`MySQL identity executor is not registered for '${column.physicalType.type}'.`);
            }
            const unsigned = column.physicalType.unsigned === true ? ' unsigned' : '';
            const builder = tableBuilder.specificType(column.name, `${type}${unsigned} auto_increment`);
            if (column.comment) builder.comment(column.comment);
            column.nullable ? builder.nullable() : builder.notNullable();
            return builder;
        };
        const baseResolveRelation = this.resolveRelation;
        /** @param {any} args @returns {Promise<any>} */
        this.resolveRelation = async function (args) {
            if (args.relation?.deferrable && args.relation.deferrable !== 'notDeferrable') {
                return {
                    diagnostics: [{
                        code: 'DEM_CAPABILITY_UNSUPPORTED',
                        details: {adapter: 'mysql', deferrable: args.relation.deferrable},
                        message: 'MySQL has no registered deferrable relation implementation.',
                    }],
                    requirements: [],
                };
            }
            return baseResolveRelation(args);
        };
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        knex: 'TeqFw_Db_Back_RDb_Dialect_Knex$',
    }),
});
