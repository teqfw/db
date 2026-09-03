// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile_A_ValidateNames
 * @description Rejects invalid or colliding normalized declaration and map identities before compilation can succeed.
 */

export default class TeqFw_Db_Back_Dem_Compile_A_ValidateNames {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic.Factory} deps.diagnostic
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Source.Factory} deps.source
     */
    constructor({diagnostic, source}) {
        /** @param {any} value @returns {boolean} */
        const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
        /** @param {string} value @returns {string} */
        const escapePointer = (value) => value.replaceAll('~', '~0').replaceAll('/', '~1');
        /** @param {string} value @returns {string} */
        const normalizeName = (value) => value.toLowerCase().trim();
        /** @param {string} value @returns {string} */
        const normalizePath = (value) => `/${value.split('/').map(normalizeName).filter(Boolean).join('/')}`;
        const localIdentifierPattern = '^[a-z][a-z0-9]*$';
        const localIdentifier = new RegExp(localIdentifierPattern);

        /**
         * @param {object} deps
         * @param {ReadonlyArray<object>} deps.fragments
         * @param {object} deps.mapEnvelope
         * @returns {ReadonlyArray<object>}
         */
        this.exec = function ({fragments, mapEnvelope}) {
            const diagnostics = [];

            /**
             * @param {object} envelope
             * @param {string} sourcePointer
             * @returns {object|null}
             */
            const evidence = function (envelope, sourcePointer) {
                const fragmentId = envelope?.fragmentId ?? envelope?.mapId;
                if (typeof fragmentId !== 'string' || !fragmentId
                    || typeof envelope?.filename !== 'string' || !envelope.filename
                    || typeof envelope?.packageName !== 'string' || !envelope.packageName) return null;
                return source.create({
                    filename: envelope.filename,
                    fragmentId,
                    packageName: envelope.packageName,
                    revision: envelope.revision,
                    sourcePointer,
                });
            };

            /**
             * @param {object} deps
             * @param {string} deps.canonicalPath
             * @param {object} deps.envelope
             * @param {string} deps.rawName
             * @param {string} deps.sourcePointer
             * @param {boolean} deps.pathName
             * @param {'entity'|'package'|'namespace'|undefined} deps.identifierKind
             * @param {object} deps.seen
             * @returns {string|null}
             */
            const claim = function ({canonicalPath, envelope, rawName, sourcePointer, pathName = false, identifierKind, seen}) {
                if (identifierKind && !localIdentifier.test(rawName)) {
                    const item = evidence(envelope, sourcePointer);
                    diagnostics.push(diagnostic.create({
                        code: 'DEM_DECLARATION_IDENTIFIER_INVALID',
                        details: {kind: identifierKind, name: rawName, pattern: localIdentifierPattern},
                        message: 'Package and entity names must use lowercase ASCII letters and digits and start with a letter.',
                        path: sourcePointer,
                        sources: item ? [item] : [],
                        stage: 'decode',
                    }));
                    return null;
                }
                const normalized = pathName ? normalizePath(rawName) : normalizeName(rawName);
                const valid = pathName ? normalized !== '/' : normalized.length > 0 && !normalized.includes('/');
                if (!valid) {
                    const item = evidence(envelope, sourcePointer);
                    diagnostics.push(diagnostic.create({
                        code: 'DEM_DECLARATION_SHAPE_INVALID',
                        details: {name: rawName},
                        message: pathName
                            ? 'Declaration path must contain at least one non-empty segment.'
                            : 'Declaration name must be non-empty and cannot contain a slash.',
                        path: sourcePointer,
                        sources: item ? [item] : [],
                        stage: 'decode',
                    }));
                    return null;
                }
                const identity = `${canonicalPath}/${escapePointer(normalized)}`;
                const previous = seen[identity];
                if (previous && previous.sourcePointer !== sourcePointer) {
                    const sources = [
                        evidence(envelope, previous.sourcePointer),
                        evidence(envelope, sourcePointer),
                    ].filter(Boolean);
                    diagnostics.push(diagnostic.create({
                        code: 'DEM_COMPOSITION_OWNER_CONFLICT',
                        details: {names: [previous.rawName, rawName].sort()},
                        message: 'Distinct declaration keys normalize to the same semantic identity.',
                        path: identity,
                        sources,
                        stage: 'composition',
                    }));
                    return null;
                }
                seen[identity] = {rawName, sourcePointer};
                return normalized;
            };

            /**
             * @param {object} container
             * @param {object} envelope
             * @param {string} canonicalPointer
             * @param {string} sourcePointer
             * @param {object} seen
             */
            const walkContainer = function (container, envelope, canonicalPointer, sourcePointer, seen) {
                if (!isObject(container)) return;
                if (isObject(container.entity)) {
                    for (const rawEntity of Object.keys(container.entity).sort()) {
                        const entitySource = `${sourcePointer}/entity/${escapePointer(rawEntity)}`;
                        const entity = claim({
                            canonicalPath: `${canonicalPointer}/entity`,
                            envelope,
                            identifierKind: 'entity',
                            rawName: rawEntity,
                            seen,
                            sourcePointer: entitySource,
                        });
                        if (!entity) continue;
                        const entityPointer = `${canonicalPointer}/entity/${escapePointer(entity)}`;
                        const value = container.entity[rawEntity];
                        for (const kind of ['attr', 'index', 'relation']) {
                            if (!isObject(value?.[kind])) continue;
                            for (const rawName of Object.keys(value[kind]).sort()) {
                                const itemSource = `${entitySource}/${kind}/${escapePointer(rawName)}`;
                                const name = claim({
                                    canonicalPath: `${entityPointer}/${kind}`,
                                    envelope,
                                    rawName,
                                    seen,
                                    sourcePointer: itemSource,
                                });
                                if (!name || kind !== 'attr') continue;
                                const attr = value[kind][rawName];
                                if (!isObject(attr?.storage)) continue;
                                for (const dialect of Object.keys(attr.storage).sort()) {
                                    claim({
                                        canonicalPath: `${entityPointer}/attr/${escapePointer(name)}/storage`,
                                        envelope,
                                        rawName: dialect,
                                        seen,
                                        sourcePointer: `${itemSource}/storage/${escapePointer(dialect)}`,
                                    });
                                }
                            }
                        }
                    }
                }
                if (isObject(container.package)) {
                    for (const rawPackage of Object.keys(container.package).sort()) {
                        const packageSource = `${sourcePointer}/package/${escapePointer(rawPackage)}`;
                        const name = claim({
                            canonicalPath: `${canonicalPointer}/package`,
                            envelope,
                            identifierKind: 'package',
                            rawName: rawPackage,
                            seen,
                            sourcePointer: packageSource,
                        });
                        if (!name) continue;
                        walkContainer(
                            container.package[rawPackage],
                            envelope,
                            `${canonicalPointer}/package/${escapePointer(name)}`,
                            packageSource,
                            seen,
                        );
                    }
                }
            };

            for (const envelope of fragments ?? []) {
                const seen = {};
                const declaration = envelope?.declaration;
                if (typeof declaration?.namespace === 'string') {
                    const pattern = '^[a-z][a-z0-9]*(\\.[a-z][a-z0-9]*)*$';
                    if (!new RegExp(pattern).test(declaration.namespace)) {
                        const item = evidence(envelope, '/namespace');
                        diagnostics.push(diagnostic.create({
                            code: 'DEM_DECLARATION_IDENTIFIER_INVALID',
                            details: {kind: 'namespace', name: declaration.namespace, pattern},
                            message: 'Fragment root namespace segments must use lowercase ASCII letters and digits and start with a letter.',
                            path: '/namespace',
                            sources: item ? [item] : [],
                            stage: 'decode',
                        }));
                    }
                }
                walkContainer(declaration, envelope, '', '', seen);
                if (isObject(declaration?.refs)) {
                    for (const rawPath of Object.keys(declaration.refs).sort()) {
                        claim({
                            canonicalPath: '/refs',
                            envelope,
                            pathName: true,
                            rawName: rawPath,
                            seen,
                            sourcePointer: `/refs/${escapePointer(rawPath)}`,
                        });
                    }
                }
            }

            if (isObject(mapEnvelope?.declaration)) {
                const seen = {};
                const declaration = mapEnvelope.declaration;
                if (isObject(declaration.ref)) {
                    for (const owner of Object.keys(declaration.ref).sort()) {
                        const values = declaration.ref[owner];
                        if (!isObject(values)) continue;
                        for (const rawPath of Object.keys(values).sort()) {
                            const sourcePointer = `/ref/${escapePointer(owner)}/${escapePointer(rawPath)}`;
                            const path = claim({
                                canonicalPath: `/ref/${escapePointer(owner)}`,
                                envelope: mapEnvelope,
                                pathName: true,
                                rawName: rawPath,
                                seen,
                                sourcePointer,
                            });
                            if (!path || !isObject(values[rawPath]?.attrs)) continue;
                            for (const alias of Object.keys(values[rawPath].attrs).sort()) {
                                claim({
                                    canonicalPath: `/ref/${escapePointer(owner)}/${escapePointer(path)}/attrs`,
                                    envelope: mapEnvelope,
                                    rawName: alias,
                                    seen,
                                    sourcePointer: `${sourcePointer}/attrs/${escapePointer(alias)}`,
                                });
                            }
                        }
                    }
                }
                if (isObject(declaration.deprecated)) {
                    for (const rawPath of Object.keys(declaration.deprecated).sort()) {
                        claim({
                            canonicalPath: '/deprecated',
                            envelope: mapEnvelope,
                            pathName: true,
                            rawName: rawPath,
                            seen,
                            sourcePointer: `/deprecated/${escapePointer(rawPath)}`,
                        });
                    }
                }
            }
            return diagnostic.sort(diagnostics);
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        source: 'TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory$',
    }),
});
