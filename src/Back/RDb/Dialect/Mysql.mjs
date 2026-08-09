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
        /** @param {string|Function} type @param {Function} args @param {Function} unsigned @param {Function} validate @returns {object} */
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
        /** @param {string} type @param {Function} project @returns {object} */
        const legacy = function (type, project = () => ({})) {
            return {
                requirements: [capability],
                project: function ({compatibility, logicalType}) {
                    const value = project({compatibility, logicalType});
                    const {compatibilitySignature, ...physical} = value;
                    return {
                        compatibilitySignature,
                        physicalType: {dialect: 'mysql', type, args: [], unsigned: false, ...physical},
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
            'legacy.binary': legacy('binary', ({logicalType}) => ({args: logicalType.params.length ? [logicalType.params.length] : []})),
            'legacy.boolean': legacy('boolean'),
            'legacy.date': legacy('date'),
            'legacy.datetime': legacy('datetime'),
            'legacy.decimal': legacy('decimal', ({compatibility, logicalType}) => ({args: [compatibility.precision ?? undefined, compatibility.scale ?? undefined], unsigned: logicalType.params.unsigned})),
            'legacy.enum': legacy('enum', ({logicalType}) => ({args: [logicalType.params.values]})),
            'legacy.increments': legacy('increments', () => ({compatibilitySignature: 'legacy.integer-reference'})),
            'legacy.integer': legacy('integer', ({logicalType}) => ({unsigned: logicalType.params.unsigned})),
            'legacy.integerUnsigned': legacy('integer', () => ({unsigned: true, compatibilitySignature: 'legacy.integer-reference'})),
            'legacy.jsonb': legacy('jsonb'),
            'legacy.string': legacy('string', ({compatibility, logicalType}) => ({args: [compatibility.declaredLength ?? logicalType.params.length]})),
            'legacy.text': legacy('text'),
            'legacy.tinyint': legacy('tinyint', ({logicalType}) => ({unsigned: logicalType.params.unsigned})),
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
            'legacy.defaultIndex': {
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
        indexes['core.btree'] = indexes['legacy.defaultIndex'];
        const adapter = knex.createAdapter({
            description: {
                id: 'mysql',
                clients: ['mariadb', 'mysql', 'mysql2'],
                registryVersions: {core: 1, legacy: 1},
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
        const baseResolveRelation = this.resolveRelation;
        /** @param {object} args @returns {Promise<object>} */
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
