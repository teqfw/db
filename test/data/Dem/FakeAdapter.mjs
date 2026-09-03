/**
 * Create a deterministic, side-effect-free adapter for compiler module tests.
 * @param {object} [options]
 * @param {ReadonlyArray<string>} [options.supportedCapabilities]
 * @returns {object}
 */
export function createFakeAdapter({supportedCapabilities = []} = {}) {
    return Object.freeze({
        describe: async function () {
            return {
                id: 'test',
                clients: ['test'],
                registryVersions: {core: 1},
                supportedCapabilities: [...supportedCapabilities],
            };
        },
        resolveType: async function ({logicalType, storage}) {
            return {
                physicalType: {
                    dialect: 'test',
                    type: storage?.type ?? logicalType.id,
                    args: Object.values(storage?.params ?? logicalType.params ?? {}),
                },
                compatibilitySignature: JSON.stringify(logicalType),
                diagnostics: [],
                requirements: [],
            };
        },
        resolveDefault: async function ({defaultValue}) {
            return {descriptor: defaultValue, diagnostics: [], requirements: []};
        },
        resolveGeneration: async function ({generation}) {
            return {descriptor: generation, diagnostics: [], requirements: []};
        },
        resolveIndex: async function ({entity, index}) {
            return {
                descriptor: {
                    include: [...index.include],
                    keys: index.keys.map((item) => ({...item})),
                    kind: index.kind,
                    method: index.method,
                    name: `${entity.path.replaceAll('/', '_')}_${index.name}`,
                    options: {...index.options},
                    predicate: index.predicate,
                },
                diagnostics: [],
                requirements: [],
            };
        },
        resolveRelation: async function ({relation}) {
            return {descriptor: structuredClone(relation), diagnostics: [], requirements: []};
        },
    });
}
