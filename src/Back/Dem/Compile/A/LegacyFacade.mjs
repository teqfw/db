// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_LegacyFacade
 * @description Derives a read-only legacy normalized DEM view from a branded compilation result.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_LegacyFacade {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
     */
    constructor({compile}) {
        /**
         * @param {any} value
         * @returns {any}
         */
        const copy = function (value) {
            if (Array.isArray(value)) return value.map(copy);
            if (value && typeof value === 'object') {
                const res = {};
                for (const key of Object.keys(value).sort()) res[key] = copy(value[key]);
                return res;
            }
            return value;
        };

        /**
         * @param {any} value
         * @returns {any}
         */
        const freeze = function (value) {
            if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
            for (const key of Reflect.ownKeys(value)) freeze(value[key]);
            return Object.freeze(value);
        };

        /**
         * @param {object} attr
         * @returns {object}
         */
        const convertAttr = function (attr) {
            const compatibility = attr.compatibility;
            if (compatibility?.source !== 'v1' || typeof compatibility.legacyType !== 'string') {
                throw new TypeError('The legacy facade can be derived only from DEM v1 compatibility nodes.');
            }
            const options = {};
            switch (compatibility.legacyType) {
                case 'binary':
                    if (attr.type.params.length !== undefined) options.length = attr.type.params.length;
                    break;
                case 'datetime':
                    if (attr.type.id === 'core.date') options.dateOnly = true;
                    break;
                case 'enum':
                    options.values = [...attr.type.params.values];
                    break;
                case 'integer':
                    if (attr.type.params.bits === 8) options.isTiny = true;
                    if (attr.type.params.unsigned === true) options.unsigned = true;
                    break;
                case 'number':
                    if (compatibility.precision !== null && compatibility.precision !== undefined) {
                        options.precision = compatibility.precision;
                    }
                    if (compatibility.scale !== null && compatibility.scale !== undefined) options.scale = compatibility.scale;
                    if (attr.type.params.unsigned === true) options.unsigned = true;
                    break;
                case 'string':
                    if (compatibility.declaredLength !== null && compatibility.declaredLength !== undefined) {
                        options.length = compatibility.declaredLength;
                    }
                    break;
            }
            const res = {
                comment: attr.comment,
                name: attr.name,
                nullable: attr.nullable,
                options,
                type: compatibility.legacyType,
            };
            if (attr.default !== undefined) {
                res.default = attr.default.kind === 'function' ? 'current' : copy(attr.default.value);
            }
            return res;
        };

        /**
         * @param {object} container
         * @returns {object}
         */
        const convertContainer = function (container) {
            const res = {entity: {}, package: {}};
            for (const entityName of Object.keys(container.entity ?? {}).sort()) {
                const entity = container.entity[entityName];
                const suffix = `/${entityName}`;
                const parent = entity.path.endsWith(suffix) ? entity.path.slice(0, -suffix.length) : '';
                const converted = {
                    attr: {},
                    comment: entity.comment,
                    index: {},
                    name: entityName,
                    path: `${parent}/`.replace('//', '/'),
                    relation: {},
                };
                for (const attrName of Object.keys(entity.attr ?? {}).sort()) {
                    converted.attr[attrName] = convertAttr(entity.attr[attrName]);
                }
                for (const indexName of Object.keys(entity.index ?? {}).sort()) {
                    const index = entity.index[indexName];
                    if (index.compatibility?.source !== 'v1') {
                        throw new TypeError('The legacy facade can be derived only from DEM v1 indexes.');
                    }
                    converted.index[indexName] = {
                        attrs: index.keys.map((item) => item.attr),
                        name: indexName,
                        type: index.kind,
                    };
                }
                for (const relationName of Object.keys(entity.relation ?? {}).sort()) {
                    const relation = entity.relation[relationName];
                    const action = {};
                    if (relation.action?.delete) action.delete = relation.action.delete.toUpperCase();
                    if (relation.action?.update) action.update = relation.action.update.toUpperCase();
                    converted.relation[relationName] = {
                        action,
                        attrs: [...relation.attrs],
                        name: relationName,
                        ref: {attrs: [...relation.ref.attrs], path: relation.ref.path},
                    };
                }
                res.entity[entityName] = converted;
            }
            for (const packageName of Object.keys(container.package ?? {}).sort()) {
                res.package[packageName] = convertContainer(container.package[packageName]);
            }
            return res;
        };

        /**
         * @param {object} deps
         * @param {object} deps.compilation
         * @returns {object}
         */
        this.exec = function ({compilation}) {
            compile.assertResult({value: compilation});
            const dem = convertContainer(compilation.model);
            dem.deprecated = copy(compilation.model.deprecated ?? {});
            const cfg = {prefix: compilation.model.namespace};
            return freeze({cfg, dem});
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        compile: 'TeqFw_Db_Back_Dem_Compile$',
    }),
});
