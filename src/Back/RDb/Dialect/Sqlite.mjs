// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Dialect_Sqlite
 * @description SQLite physical projection adapter with explicit frozen registries.
 */

export default class TeqFw_Db_Back_RDb_Dialect_Sqlite {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_Dialect_Knex} deps.knex
     */
    constructor({knex}) {
        const capability = 'sqlite.core';
        /**
         * @param {string} type
         * @param {Function} args
         * @param {Function} unsigned
         * @param {Function} validate
         * @returns {object}
         */
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
                            dialect: 'sqlite', type: physicalType, args: args(logicalType), unsigned: unsigned(logicalType),
                        },
                    };
                },
            };
        };
        /** @param {object} type @returns {ReadonlyArray<object>} */
        const rejectUnsigned = (type) => type.params.unsigned ? [{
            code: 'DEM_STORAGE_UNSUPPORTED',
            details: {adapter: 'sqlite', type: type.id},
            message: 'SQLite has no registered exact unsigned numeric storage mapping.',
        }] : [];
        const types = {
            'core.binary': entry('binary', (type) => type.params.length ? [type.params.length] : []),
            'core.boolean': entry('boolean'),
            'core.date': entry('date'),
            'core.datetime': entry('datetime', (type) => [{precision: type.params.precision, useTz: type.params.timezone}]),
            'core.decimal': entry('decimal', (type) => [type.params.precision, type.params.scale], (type) => type.params.unsigned, rejectUnsigned),
            'core.enum': entry('enum', (type) => [type.params.values]),
            'core.integer': entry((type) => ({8: 'tinyint', 16: 'smallint', 32: 'integer', 64: 'bigint'}[type.params.bits]), () => [], (type) => type.params.unsigned, rejectUnsigned),
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
                id: 'sqlite',
                clients: ['better-sqlite3', 'sqlite3'],
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
        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        knex: 'TeqFw_Db_Back_RDb_Dialect_Knex$',
    }),
});
