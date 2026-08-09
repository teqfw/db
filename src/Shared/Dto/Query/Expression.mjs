// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Dto_Query_Expression
 * @description Immutable closed attr/value/call query expression DTOs.
 */

const NS = 'TeqFw_Db_Shared_Dto_Query_Expression';

export default class TeqFw_Db_Shared_Dto_Query_Expression {
    /** @type {'attr'|'value'|'call'} */ kind;
    /** @type {string} */ name;
    /** @type {any} */ value;
    /** @type {object} */ type;
    /** @type {string} */ operator;
    /** @type {ReadonlyArray<object>} */ args;
}

export class Factory {
    static namespace = NS;

    /** Initialize structural expression validation. */
    constructor() {
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
        /**
         * @param {object} value
         * @param {ReadonlyArray<string>} allowed
         */
        const closed = function (value, allowed) {
            const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
            if (unknown.length) throw new TypeError(`Unknown expression field '${unknown.sort()[0]}'.`);
        };

        /** @param {any} data @returns {Readonly<TeqFw_Db_Shared_Dto_Query_Expression>} */
        this.create = function (data) {
            if (data instanceof TeqFw_Db_Shared_Dto_Query_Expression) {
                data = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
            }
            if (!isObject(data)) throw new TypeError('Query expression must be an object.');
            const result = new TeqFw_Db_Shared_Dto_Query_Expression();
            if (data.kind === 'attr') {
                closed(data, ['kind', 'name']);
                if (typeof data.name !== 'string' || !data.name) throw new TypeError('Attribute expression requires a name.');
                result.kind = 'attr';
                result.name = data.name;
            } else if (data.kind === 'value') {
                closed(data, ['kind', 'type', 'value']);
                if (!Object.prototype.hasOwnProperty.call(data, 'value')) throw new TypeError('Value expression requires a value field.');
                result.kind = 'value';
                result.value = structuredClone(data.value);
                if (data.type !== undefined) {
                    if (!isObject(data.type) || typeof data.type.id !== 'string' || !isObject(data.type.params ?? {})) {
                        throw new TypeError('Value expression type must contain id and params.');
                    }
                    closed(data.type, ['id', 'params']);
                    result.type = {id: data.type.id, params: structuredClone(data.type.params ?? {})};
                }
            } else if (data.kind === 'call') {
                closed(data, ['args', 'kind', 'operator']);
                if (typeof data.operator !== 'string' || !data.operator || !Array.isArray(data.args)) {
                    throw new TypeError('Call expression requires operator and args.');
                }
                result.kind = 'call';
                result.operator = data.operator;
                result.args = data.args.map((item) => this.create(item));
            } else {
                throw new TypeError(`Unknown query expression kind '${data.kind}'.`);
            }
            return freeze(result);
        };
    }
}

Object.freeze(TeqFw_Db_Shared_Dto_Query_Expression);
