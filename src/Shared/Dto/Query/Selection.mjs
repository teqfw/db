// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Dto_Query_Selection
 * @description Immutable closed Selection v2 DTO.
 */

const NS = 'TeqFw_Db_Shared_Dto_Query_Selection';

export default class TeqFw_Db_Shared_Dto_Query_Selection {
    /** @type {number} */ version;
    /** @type {object} */ where;
    /** @type {ReadonlyArray<object>} */ select;
    /** @type {ReadonlyArray<object>} */ orderBy;
    /** @type {number} */ limit;
    /** @type {number} */ offset;
    /** @type {object} */ execution;
}

export class Factory {
    static namespace = NS;

    /** @param {object} deps @param {TeqFw_Db_Shared_Dto_Query_Expression.Factory} deps.expression */
    constructor({expression}) {
        /** @param {any} value @returns {boolean} */
        const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
        /** @param {any} value @param {WeakSet<object>} visited @returns {any} */
        const freeze = function (value, visited = new WeakSet()) {
            if (ArrayBuffer.isView(value)) return value;
            if (value && typeof value === 'object' && visited.has(value)) return value;
            if (value && typeof value === 'object') visited.add(value);
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key], visited);
            return Object.freeze(value);
        };

        /** @param {any} data @returns {Readonly<TeqFw_Db_Shared_Dto_Query_Selection>} */
        this.create = function (data) {
            if (!isObject(data) || data.version !== 2) throw new TypeError('Selection v2 requires version: 2.');
            const allowed = ['execution', 'limit', 'offset', 'orderBy', 'select', 'version', 'where'];
            const unknown = Object.keys(data).filter((key) => !allowed.includes(key));
            if (unknown.length) throw new TypeError(`Unknown selection field '${unknown.sort()[0]}'.`);
            const result = new TeqFw_Db_Shared_Dto_Query_Selection();
            result.version = 2;
            if (data.where !== undefined) result.where = expression.create(data.where);
            if (data.select !== undefined && !Array.isArray(data.select)) throw new TypeError('Selection select must be an array.');
            result.select = (data.select ?? []).map((item) => {
                if (!isObject(item) || typeof item.as !== 'string' || !item.as || item.expression === undefined) {
                    throw new TypeError('Derived selection requires as and expression.');
                }
                const fields = Object.keys(item).filter((key) => !['as', 'expression'].includes(key));
                if (fields.length) throw new TypeError(`Unknown derived selection field '${fields.sort()[0]}'.`);
                return {as: item.as, expression: expression.create(item.expression)};
            });
            if (new Set(result.select.map((item) => item.as)).size !== result.select.length) {
                throw new TypeError('Derived selection aliases must be unique.');
            }
            if (data.orderBy !== undefined && !Array.isArray(data.orderBy)) throw new TypeError('Selection orderBy must be an array.');
            result.orderBy = (data.orderBy ?? []).map((item) => {
                if (!isObject(item) || !['asc', 'desc'].includes(item.direction) || item.expression === undefined) {
                    throw new TypeError('Selection ordering requires expression and asc/desc direction.');
                }
                const fields = Object.keys(item).filter((key) => !['direction', 'expression'].includes(key));
                if (fields.length) throw new TypeError(`Unknown ordering field '${fields.sort()[0]}'.`);
                return {direction: item.direction, expression: expression.create(item.expression)};
            });
            for (const name of ['limit', 'offset']) {
                const value = data[name] ?? 0;
                if (!Number.isInteger(value) || value < 0) throw new TypeError(`Selection ${name} must be a non-negative integer.`);
                result[name] = value;
            }
            if (data.execution !== undefined && !isObject(data.execution)) throw new TypeError('Selection execution must be an object.');
            result.execution = structuredClone(data.execution ?? {});
            return freeze(result);
        };
    }
}

Object.freeze(TeqFw_Db_Shared_Dto_Query_Selection);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
        expression: 'TeqFw_Db_Shared_Dto_Query_Expression__Factory$',
    }),
});
