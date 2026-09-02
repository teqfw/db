// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_Compose
 * @description Composes decoded DEM fragments with single-owner semantics and trusted provenance.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_Compose {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic.Factory} deps.diagnostic
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Source.Factory} deps.source
     */
    constructor({diagnostic, source}) {
        /**
         * @param {string} value
         * @returns {string}
         */
        const escapePointer = function (value) {
            return value.replaceAll('~', '~0').replaceAll('/', '~1');
        };

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
         * @param {object} deps
         * @param {ReadonlyArray<object>} deps.decoded
         * @returns {object}
         */
        this.exec = function ({decoded}) {
            const diagnostics = [];
            const externalRefs = {};
            const invalid = new Set();
            const model = {version: 2, namespace: '', requires: [], deprecated: {}, entity: {}, package: {}};
            const ownerByPath = {};
            const provenance = {};
            const conflictSources = {};

            /**
             * @param {object} item
             * @param {string} canonicalPath
             * @returns {object}
             */
            const makeSource = function (item, canonicalPath) {
                return source.create({
                    filename: item.envelope.filename,
                    fragmentId: item.envelope.fragmentId,
                    packageName: item.envelope.packageName,
                    revision: item.envelope.revision,
                    sourcePointer: item.pointers[canonicalPath] ?? canonicalPath,
                });
            };

            /**
             * @param {string} path
             * @param {object} evidence
             */
            const appendProvenance = function (path, evidence) {
                const values = provenance[path] ?? [];
                const key = `${evidence.fragmentId}\u0000${evidence.filename}\u0000${evidence.sourcePointer}`;
                if (!values.some((item) => `${item.fragmentId}\u0000${item.filename}\u0000${item.sourcePointer}` === key)) {
                    values.push(evidence);
                    values.sort((a, b) => {
                        const left = `${a.fragmentId}\u0000${a.filename}\u0000${a.sourcePointer}`;
                        const right = `${b.fragmentId}\u0000${b.filename}\u0000${b.sourcePointer}`;
                        return left.localeCompare(right);
                    });
                }
                provenance[path] = values;
            };

            /**
             * @param {string} path
             * @param {object} item
             */
            const conflict = function (path, item) {
                invalid.add(path);
                const values = conflictSources[path] ?? [...(provenance[path] ?? [])];
                const evidence = makeSource(item, path);
                const key = `${evidence.fragmentId}\u0000${evidence.filename}\u0000${evidence.sourcePointer}`;
                if (!values.some((entry) => `${entry.fragmentId}\u0000${entry.filename}\u0000${entry.sourcePointer}` === key)) {
                    values.push(evidence);
                }
                conflictSources[path] = values;
                appendProvenance(path, evidence);
            };

            /**
             * @param {object} entity
             * @param {string} path
             * @param {object} item
             * @param {boolean} claim
             */
            const semanticEntity = function (entity, path, item, claim) {
                const paths = [path];
                for (const name of Object.keys(entity.attr ?? {}).sort()) {
                    const attrPath = `${path}/attr/${escapePointer(name)}`;
                    paths.push(attrPath);
                    const attr = entity.attr[name];
                    for (const dialect of Object.keys(attr.storage ?? {}).sort()) {
                        paths.push(`${attrPath}/storage/${escapePointer(dialect)}`);
                    }
                    if (attr.default !== undefined) paths.push(`${attrPath}/default`);
                    if (attr.generation !== undefined) paths.push(`${attrPath}/generation`);
                }
                for (const name of Object.keys(entity.index ?? {}).sort()) paths.push(`${path}/index/${escapePointer(name)}`);
                for (const name of Object.keys(entity.relation ?? {}).sort()) paths.push(`${path}/relation/${escapePointer(name)}`);
                for (const semanticPath of paths) {
                    if (claim && !ownerByPath[semanticPath]) {
                        ownerByPath[semanticPath] = item.envelope.fragmentId;
                        appendProvenance(semanticPath, makeSource(item, semanticPath));
                    } else if (!claim && ownerByPath[semanticPath]) {
                        conflict(semanticPath, item);
                    }
                }
            };

            /**
             * @param {object} target
             * @param {object} incoming
             * @param {string} path
             * @param {object} item
             */
            const mergeContainer = function (target, incoming, path, item) {
                if (Object.prototype.hasOwnProperty.call(incoming, 'comment')) {
                    const commentPath = `${path}/comment`;
                    if (ownerByPath[commentPath]) {
                        conflict(commentPath, item);
                        delete target.comment;
                    } else {
                        target.comment = incoming.comment;
                        ownerByPath[commentPath] = item.envelope.fragmentId;
                        appendProvenance(commentPath, makeSource(item, commentPath));
                    }
                }
                for (const name of Object.keys(incoming.entity ?? {}).sort()) {
                    const entityPath = `${path}/entity/${escapePointer(name)}`;
                    if (ownerByPath[entityPath]) {
                        semanticEntity(incoming.entity[name], entityPath, item, false);
                        delete target.entity[name];
                    } else {
                        target.entity[name] = copy(incoming.entity[name]);
                        semanticEntity(incoming.entity[name], entityPath, item, true);
                    }
                }
                for (const name of Object.keys(incoming.package ?? {}).sort()) {
                    const packagePath = `${path}/package/${escapePointer(name)}`;
                    if (!target.package[name]) target.package[name] = {entity: {}, package: {}};
                    mergeContainer(target.package[name], incoming.package[name], packagePath, item);
                }
            };

            const sorted = [...decoded].sort((a, b) => {
                const fragment = String(a.envelope?.fragmentId ?? '').localeCompare(String(b.envelope?.fragmentId ?? ''));
                return fragment || String(a.envelope?.filename ?? '').localeCompare(String(b.envelope?.filename ?? ''));
            });
            const requirements = new Set();
            for (const item of sorted) {
                diagnostics.push(...(item.diagnostics ?? []));
                if (!item.declaration || !item.envelope) continue;
                externalRefs[item.envelope.fragmentId] = {
                    refs: copy(item.declaration.refs ?? {}),
                    pointers: copy(item.pointers),
                    envelope: item.envelope,
                };
                for (const capability of item.declaration.requires ?? []) {
                    requirements.add(capability);
                    appendProvenance(`/requires/${escapePointer(capability)}`, makeSource(item, `/requires/${escapePointer(capability)}`));
                }
                mergeContainer(model, item.declaration, '', item);
            }
            model.requires = [...requirements].sort();
            for (const path of Object.keys(conflictSources).sort()) {
                diagnostics.push(diagnostic.create({
                    code: 'DEM_COMPOSITION_OWNER_CONFLICT',
                    details: {owners: [...new Set(conflictSources[path].map((item) => item.fragmentId))].sort()},
                    message: 'More than one fragment declares the same semantic node.',
                    path,
                    sources: conflictSources[path],
                    stage: 'composition',
                }));
            }
            return {diagnostics, externalRefs, invalid, model, ownerByPath, provenance};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        source: 'TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory$',
    }),
});
