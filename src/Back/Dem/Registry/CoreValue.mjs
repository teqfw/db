// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Registry_CoreValue
 * @description Canonicalizes registered core logical types and validates runtime values before database binding.
 */

export default class TeqFw_Db_Back_Dem_Registry_CoreValue {
    /** @param {object} deps @param {TeqFw_Db_Back_Dem_Registry_Core} deps.core */
    constructor({core}) {
        /** @param {any} value @returns {any} */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        /**
         * @param {object} deps
         * @param {object} deps.type
         * @param {boolean} deps.allowAny
         * @returns {any}
         */
        this.normalizeType = function ({type, allowAny = false}) {
            if (!type || typeof type !== 'object' || Array.isArray(type)
                || typeof type.id !== 'string' || !type.params || typeof type.params !== 'object'
                || Array.isArray(type.params)) return null;
            if (allowAny && type.id === 'core.any' && Object.keys(type.params).length === 0) {
                return Object.freeze({id: 'core.any', params: Object.freeze({})});
            }
            const entry = core.types[type.id];
            if (!entry) return null;
            const allowed = entry.params.allowed ?? [];
            if (Object.keys(type.params).some((name) => !allowed.includes(name))) return null;
            const params = {...(entry.params.defaults ?? {}), ...type.params};
            let valid = true;
            switch (type.id) {
                case 'core.binary':
                    valid = params.length === undefined || Number.isInteger(params.length) && params.length > 0;
                    break;
                case 'core.datetime':
                    valid = typeof params.timezone === 'boolean'
                        && (params.precision === undefined || Number.isInteger(params.precision) && params.precision >= 0);
                    break;
                case 'core.decimal':
                    valid = Number.isInteger(params.precision) && params.precision > 0
                        && Number.isInteger(params.scale) && params.scale >= 0 && params.scale <= params.precision
                        && typeof params.unsigned === 'boolean';
                    break;
                case 'core.enum':
                    valid = Array.isArray(params.values) && params.values.length > 0
                        && params.values.every((item) => typeof item === 'string')
                        && new Set(params.values).size === params.values.length;
                    break;
                case 'core.integer':
                    valid = [8, 16, 32, 64].includes(params.bits) && typeof params.unsigned === 'boolean';
                    break;
                case 'core.string':
                    valid = Number.isInteger(params.length) && params.length > 0;
                    break;
                case 'core.vector':
                    valid = Number.isInteger(params.dimensions) && params.dimensions > 0
                        && ['bit', 'float'].includes(params.element) && typeof params.sparse === 'boolean'
                        && !(params.element === 'bit' && params.sparse === true);
                    break;
            }
            return valid ? freeze({id: type.id, params}) : null;
        };

        /**
         * @param {object} deps
         * @param {object} deps.type
         * @param {object} deps.value
         * @param {boolean} deps.allowAny
         * @returns {boolean}
         */
        this.matches = function ({type, value, allowAny = false}) {
            const canonical = this.normalizeType({allowAny, type});
            if (!canonical) return false;
            const params = canonical.params;
            switch (canonical.id) {
                case 'core.any':
                    return allowAny && value !== undefined;
                case 'core.binary': {
                    if (!(Buffer.isBuffer(value) || value instanceof Uint8Array)) return false;
                    return params.length === undefined || value.byteLength <= params.length;
                }
                case 'core.boolean':
                    return typeof value === 'boolean';
                case 'core.date': {
                    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
                    const [year, month, day] = value.split('-').map(Number);
                    const parsed = new Date(Date.UTC(year, month - 1, day));
                    return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1
                        && parsed.getUTCDate() === day;
                }
                case 'core.datetime':
                    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
                case 'core.decimal': {
                    if (!((typeof value === 'number' && Number.isFinite(value)) || typeof value === 'string')) return false;
                    const literal = String(value);
                    if (!/^-?\d+(?:\.\d+)?$/.test(literal)) return false;
                    const [integer, fraction = ''] = literal.replace('-', '').split('.');
                    const integerDigits = integer.replace(/^0+/, '').length;
                    return integerDigits <= params.precision - params.scale && fraction.length <= params.scale
                        && (params.unsigned !== true || !literal.startsWith('-'));
                }
                case 'core.enum':
                    return typeof value === 'string' && params.values.includes(value);
                case 'core.integer': {
                    if (!Number.isSafeInteger(value)) return false;
                    const minimum = params.unsigned ? 0 : params.bits === 64 ? Number.MIN_SAFE_INTEGER : -(2 ** (params.bits - 1));
                    const maximum = params.bits === 64 ? Number.MAX_SAFE_INTEGER
                        : params.unsigned ? 2 ** params.bits - 1 : 2 ** (params.bits - 1) - 1;
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
                case 'core.vector': {
                    if (params.element === 'bit') {
                        return typeof value === 'string' && value.length === params.dimensions && /^[01]+$/.test(value);
                    }
                    if (params.sparse === true) {
                        if (!value || typeof value !== 'object' || Array.isArray(value)
                            || value.dimensions !== params.dimensions || !Array.isArray(value.entries)
                            || value.entries.length > 16_000) return false;
                        return value.entries.every((entry, index, entries) => entry && Number.isInteger(entry.index)
                            && entry.index > 0 && entry.index <= params.dimensions
                            && typeof entry.value === 'number' && Number.isFinite(entry.value) && entry.value !== 0
                            && (index === 0 || entries[index - 1].index < entry.index));
                    }
                    return Array.isArray(value) && value.length === params.dimensions
                        && value.every((item) => typeof item === 'number' && Number.isFinite(item));
                }
                default:
                    return false;
            }
        };

        Object.freeze(this);
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        core: 'TeqFw_Db_Back_Dem_Registry_Core$',
    }),
});
