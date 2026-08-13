// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Registry_Core
 * @description Frozen core DEM type, default, generation, and expression registries.
 */

/**
 * Core logical registries shared by compilation and typed expressions.
 */
export default class TeqFw_Db_Back_Dem_Registry_Core {
    /**
     * Initialize immutable core registries.
     */
    constructor() {
        /**
         * @param {any} value
         * @returns {any}
         */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        const noParams = Object.freeze({allowed: Object.freeze([])});
        this.types = freeze({
            'core.binary': {params: {allowed: ['length']}},
            'core.boolean': {params: noParams},
            'core.date': {params: noParams},
            'core.datetime': {params: {allowed: ['precision', 'timezone'], defaults: {timezone: false}}},
            'core.decimal': {params: {allowed: ['precision', 'scale', 'unsigned'], defaults: {unsigned: false}}},
            'core.enum': {params: {allowed: ['values']}},
            'core.integer': {params: {allowed: ['bits', 'unsigned'], defaults: {bits: 32, unsigned: false}}},
            'core.identity': {params: noParams},
            'core.json': {params: noParams},
            'core.string': {params: {allowed: ['length']}},
            'core.text': {params: noParams},
            'core.uuid': {params: noParams},
            'core.vector': {params: {allowed: ['dimensions', 'element', 'sparse']}},
            'core.ref': {params: noParams},
        });
        this.defaults = freeze({
            'core.currentDate': {types: ['core.date']},
            'core.currentTimestamp': {types: ['core.datetime']},
        });
        this.generations = freeze({
            'core.identity': {types: ['core.integer'], params: {allowed: ['mode'], defaults: {mode: 'byDefault'}}},
        });
        this.operators = freeze({
            'core.and': {arity: {min: 2}, args: 'boolean', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.eq': {arity: 2, args: 'same', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.gte': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.gt': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.isNull': {arity: 1, args: 'any', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.lower': {arity: 1, args: ['core.string', 'core.text'], result: 'same', contexts: ['filter', 'projection', 'ordering', 'index', 'predicate']},
            'core.lte': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.lt': {arity: 2, args: 'orderedSame', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.not': {arity: 1, args: 'boolean', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.notEq': {arity: 2, args: 'same', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.notNull': {arity: 1, args: 'any', result: 'core.boolean', contexts: ['filter', 'predicate']},
            'core.or': {arity: {min: 2}, args: 'boolean', result: 'core.boolean', contexts: ['filter', 'predicate']},
        });
        Object.freeze(this);
    }
}
