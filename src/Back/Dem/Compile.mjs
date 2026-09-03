// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Compile
 * @description Side-effect-free orchestration for versioned DEM compilation.
 */

export default class TeqFw_Db_Back_Dem_Compile {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Compile_A_DecodeV2} deps.decodeV2
     * @param {TeqFw_Db_Back_Dem_Compile_A_Compose} deps.compose
     * @param {TeqFw_Db_Back_Dem_Compile_A_MapRefs} deps.mapRefs
     * @param {TeqFw_Db_Back_Dem_Compile_A_Validate} deps.validate
     * @param {TeqFw_Db_Back_Dem_Compile_A_ValidateNames} deps.validateNames
     * @param {TeqFw_Db_Back_Dem_Compile_A_Graph} deps.graph
     * @param {TeqFw_Db_Back_Dem_Compile_A_Fingerprint} deps.fingerprint
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory} deps.diagnostic
     * @param {TeqFw_Db_Back_Dto_Dem_Compile_Result__Factory} deps.resultFactory
     */
    constructor({decodeV2, compose, mapRefs, validate, validateNames, graph, fingerprint, diagnostic, resultFactory}) {
        const successful = new WeakSet();

        /**
         * @param {unknown} value
         * @returns {unknown}
         */
        const normalize = function (value) {
            if (Array.isArray(value)) return value.map(normalize);
            if (value && typeof value === 'object') {
                const object = /** @type {TeqFw_Db_Object} */ (value);
                /** @type {TeqFw_Db_Object} */
                const res = {};
                for (const key of Object.keys(object).sort()) res[key] = normalize(object[key]);
                return res;
            }
            return value;
        };

        /**
         * @param {TeqFw_Db_ObjectArray} diagnostics
         * @param {TeqFw_Db_ObjectArray} warnings
         * @returns {TeqFw_Db_Error}
         */
        const createError = function (diagnostics, warnings) {
            const error = new Error(`DEM compilation failed with ${diagnostics.length} error(s).`);
            error.name = 'DemCompilationError';
            Object.defineProperties(error, {
                diagnostics: {enumerable: true, value: Object.freeze([...diagnostics])},
                warnings: {enumerable: true, value: Object.freeze([...warnings])},
            });
            return Object.freeze(error);
        };

        /**
         * Reject values that were not produced successfully by this compiler instance.
         * @param {object} deps
         * @param {object} deps.value
         * @returns {any}
         */
        this.assertResult = function ({value}) {
            if (!value || typeof value !== 'object' || !successful.has(value)) {
                throw new TypeError('A successful DEM compilation result is required.');
            }
            return value;
        };

        /**
         * @param {object} deps
         * @param {TeqFw_Db_DemFragmentArray} deps.fragments
         * @param {TeqFw_Db_DemEnvelope} deps.mapEnvelope
         * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.adapter
         * @returns {Promise<any>}
         * @throws {TeqFw_Db_Error}
         */
        this.exec = async function ({fragments, mapEnvelope, adapter}) {
            const input = Array.isArray(fragments) ? fragments : [];
            const sorted = input.map((item) => ({
                declaration: item?.declaration,
                filename: item?.filename,
                fragmentId: item?.fragmentId,
                packageName: item?.packageName,
                revision: fingerprint.exec({value: item?.declaration}),
            })).sort((a, b) => {
                const fragment = String(a.fragmentId ?? '').localeCompare(String(b.fragmentId ?? ''));
                return fragment || String(a.filename ?? '').localeCompare(String(b.filename ?? ''));
            });
            const trustedMap = mapEnvelope && typeof mapEnvelope === 'object' ? {
                ...mapEnvelope,
                revision: fingerprint.exec({value: mapEnvelope.declaration}),
            } : mapEnvelope;
            const nameDiagnostics = validateNames.exec({fragments: sorted, mapEnvelope: trustedMap});
            const decoded = sorted.map((envelope) => decodeV2.exec({envelope}));
            const composed = compose.exec({decoded});
            const mapped = mapRefs.exec({composed, mapEnvelope: trustedMap});
            const validated = validate.exec({mapped});
            const analyzed = graph.exec({validated});
            const allDiagnostics = [...nameDiagnostics, ...analyzed.diagnostics];
            let physical = null;
            const requirements = new Set(analyzed.model.requires ?? []);

            /**
             * Retain every declaration source that derives a runtime capability.
             * @param {string} capability
             * @param {string} originPath
             */
            const addRequirement = function (capability, originPath) {
                requirements.add(capability);
                const requirementPath = '/requires/' + capability.replaceAll('~', '~0').replaceAll('/', '~1');
                const values = analyzed.provenance[requirementPath] ?? [];
                const sources = analyzed.provenance[originPath] ?? [];
                for (const item of sources) {
                    const key = item.fragmentId + '\u0000' + item.filename + '\u0000' + item.sourcePointer;
                    const exists = values.some((entry) => entry.fragmentId + '\u0000' + entry.filename + '\u0000' + entry.sourcePointer === key);
                    if (!exists) values.push(item);
                }
                values.sort((left, right) => {
                    const a = left.fragmentId + '\u0000' + left.filename + '\u0000' + left.sourcePointer;
                    const b = right.fragmentId + '\u0000' + right.filename + '\u0000' + right.sourcePointer;
                    return a.localeCompare(b);
                });
                analyzed.provenance[requirementPath] = values;
            };

            /**
             * @param {TeqFw_Db_ObjectArray} values
             * @param {string} fallbackPath
             * @param {string} fallbackStage
             */
            const ingestDiagnostics = function (values, fallbackPath, fallbackStage) {
                for (const value of values ?? []) {
                    if (value?.code && value?.message && value?.stage && value?.severity) {
                        allDiagnostics.push(diagnostic.create({
                            code: value.code,
                            details: value.details ?? {},
                            message: value.message,
                            path: value.path ?? fallbackPath,
                            severity: value.severity,
                            sources: value.sources ?? analyzed.provenance[fallbackPath] ?? [],
                            stage: value.stage,
                        }));
                    } else {
                        allDiagnostics.push(diagnostic.create({
                            code: value?.code ?? 'DEM_STORAGE_UNSUPPORTED',
                            details: value?.details ?? {},
                            message: value?.message ?? 'Dialect adapter could not resolve a physical descriptor.',
                            path: value?.path ?? fallbackPath,
                            sources: value?.sources ?? analyzed.provenance[fallbackPath] ?? [],
                            stage: fallbackStage,
                        }));
                    }
                }
            };

            const hasLogicalError = allDiagnostics.some((item) => item.severity === 'error');
            if (!hasLogicalError) {
                const requiredMethods = ['describe', 'resolveType', 'resolveDefault', 'resolveGeneration', 'resolveIndex', 'resolveRelation'];
                const missing = requiredMethods.filter((name) => typeof adapter?.[name] !== 'function');
                if (missing.length > 0) {
                    allDiagnostics.push(diagnostic.create({
                        code: 'DEM_CAPABILITY_UNSUPPORTED',
                        details: {adapterMethods: missing},
                        message: 'Selected dialect adapter does not implement the compilation contract.',
                        path: '',
                        sources: [],
                        stage: 'dialect',
                    }));
                } else {
                    const description = await adapter.describe();
                    const tables = [];
                    const relations = [];
                    const tableIndexes = [];
                    const afterRelations = [];
                    const afterData = [];
                    const physicalByAttr = {};
                    const physicalNames = {};
                    /** @param {string} name @param {string} path */
                    const claimPhysicalName = function (name, path) {
                        const previous = physicalNames[name];
                        if (previous && previous !== path) {
                            allDiagnostics.push(diagnostic.create({
                                code: 'DEM_PHYSICAL_NAME_COLLISION',
                                details: {name, paths: [previous, path].sort()},
                                message: 'Distinct physical schema objects resolve to the same name.',
                                path,
                                sources: analyzed.provenance[path] ?? [],
                                stage: 'dialect',
                            }));
                        } else {
                            physicalNames[name] = path;
                        }
                    };
                    for (const entityPath of Object.keys(analyzed.entities).sort()) {
                        const info = analyzed.entities[entityPath];
                        claimPhysicalName(info.tableName, info.pointer);
                        const table = {
                            comment: info.entity.comment,
                            columns: [],
                            entity: entityPath,
                            name: info.tableName,
                        };
                        physicalByAttr[entityPath] = {};
                        for (const attrName of Object.keys(info.entity.attr).sort()) {
                            const attr = info.entity.attr[attrName];
                            const path = `${info.pointer}/attr/${attrName.replaceAll('~', '~0').replaceAll('/', '~1')}`;
                            const storage = attr.storage?.[description.id];
                            const resolved = await adapter.resolveType({location: path, logicalType: attr.type, storage});
                            ingestDiagnostics(resolved?.diagnostics, path, 'dialect');
                            for (const item of resolved?.requirements ?? []) addRequirement(item, path);
                            if (!resolved?.physicalType) {
                                ingestDiagnostics([{
                                    code: 'DEM_STORAGE_UNSUPPORTED',
                                    details: {adapter: description.id, type: attr.type.id},
                                    message: 'Selected adapter did not resolve attribute storage.',
                                }], path, 'dialect');
                                continue;
                            }
                            const column = {
                                comment: attr.comment,
                                logicalType: attr.type,
                                name: attrName,
                                nullable: attr.nullable,
                                physicalType: resolved.physicalType,
                                requirements: [...new Set(resolved.requirements ?? [])].sort(),
                            };
                            physicalByAttr[entityPath][attrName] = resolved.compatibilitySignature
                                ?? JSON.stringify(normalize(resolved.physicalType));
                            if (attr.default !== undefined) {
                                const value = await adapter.resolveDefault({
                                    defaultValue: attr.default,
                                    location: `${path}/default`,
                                    logicalType: attr.type,
                                });
                                ingestDiagnostics(value?.diagnostics, `${path}/default`, 'dialect');
                                for (const item of value?.requirements ?? []) addRequirement(item, `${path}/default`);
                                column.defaultValue = value?.descriptor;
                            }
                            if (attr.generation !== undefined) {
                                const value = await adapter.resolveGeneration({
                                    generation: attr.generation,
                                    location: `${path}/generation`,
                                    logicalType: attr.type,
                                });
                                ingestDiagnostics(value?.diagnostics, `${path}/generation`, 'dialect');
                                for (const item of value?.requirements ?? []) addRequirement(item, `${path}/generation`);
                                column.generation = value?.descriptor;
                            }
                            table.columns.push(column);
                        }
                        for (const indexName of Object.keys(info.entity.index).sort()) {
                            const index = info.entity.index[indexName];
                            const path = `${info.pointer}/index/${indexName.replaceAll('~', '~0').replaceAll('/', '~1')}`;
                            const value = await adapter.resolveIndex({
                                entity: info.entity, index, location: path,
                                physicalName: info.tableName + '_' + indexName,
                            });
                            ingestDiagnostics(value?.diagnostics, path, 'dialect');
                            for (const item of value?.requirements ?? []) addRequirement(item, path);
                            if (value?.descriptor) {
                                const descriptor = {...value.descriptor, entity: entityPath, name: value.descriptor.name ?? indexName, phase: index.phase};
                                claimPhysicalName(descriptor.name, path);
                                if (index.phase === 'table') tableIndexes.push(descriptor);
                                if (index.phase === 'afterRelations') afterRelations.push(descriptor);
                                if (index.phase === 'afterData') afterData.push(descriptor);
                            }
                        }
                        tables.push(table);
                    }
                    for (const entityPath of Object.keys(analyzed.entities).sort()) {
                        const info = analyzed.entities[entityPath];
                        for (const relationName of Object.keys(info.entity.relation).sort()) {
                            const relation = info.entity.relation[relationName];
                            const path = `${info.pointer}/relation/${relationName.replaceAll('~', '~0').replaceAll('/', '~1')}`;
                            let compatible = true;
                            for (let index = 0; index < relation.attrs.length; index++) {
                                const left = physicalByAttr[entityPath]?.[relation.attrs[index]];
                                const right = physicalByAttr[relation.ref.path]?.[relation.ref.attrs[index]];
                                if (left !== undefined && right !== undefined && left !== right) compatible = false;
                            }
                            if (!compatible) {
                                allDiagnostics.push(diagnostic.create({
                                    code: 'DEM_RELATION_TYPE_MISMATCH',
                                    details: {scope: 'physical'},
                                    message: 'Relation attributes have incompatible physical representations.',
                                    path,
                                    sources: analyzed.provenance[path] ?? [],
                                    stage: 'dialect',
                                }));
                            }
                            const value = typeof adapter.resolveRelation === 'function'
                                ? await adapter.resolveRelation({entity: info.entity, location: path, relation})
                                : {descriptor: normalize(relation), diagnostics: [], requirements: []};
                            ingestDiagnostics(value?.diagnostics, path, 'dialect');
                            for (const item of value?.requirements ?? []) addRequirement(item, path);
                            if (value?.descriptor) {
                                const physicalName = info.tableName + '_fk_' + relationName;
                                claimPhysicalName(physicalName, path);
                                relations.push({
                                    ...value.descriptor,
                                    columns: [...relation.attrs],
                                    entity: entityPath,
                                    name: physicalName,
                                    relation: relationName,
                                    referencedColumns: [...relation.ref.attrs],
                                    referencedEntity: relation.ref.path,
                                    referencedTable: analyzed.entities[relation.ref.path].tableName,
                                    table: info.tableName,
                                });
                            }
                        }
                    }
                    const supported = new Set(description.supportedCapabilities ?? []);
                    for (const capability of requirements) {
                        if (!supported.has(capability)) {
                            allDiagnostics.push(diagnostic.create({
                                code: 'DEM_CAPABILITY_UNSUPPORTED',
                                details: {adapter: description.id, capability},
                                message: 'Selected adapter does not support a required capability.',
                                path: `/requires/${capability.replaceAll('~', '~0').replaceAll('/', '~1')}`,
                                sources: analyzed.provenance[`/requires/${capability.replaceAll('~', '~0').replaceAll('/', '~1')}`] ?? [],
                                stage: 'dialect',
                            }));
                        }
                    }
                    physical = {
                        adapter: description.id,
                        namespace: analyzed.model.namespace,
                        registryVersions: normalize(description.registryVersions ?? {}),
                        tables,
                        phases: {
                            preflight: {requirements: [...requirements].sort()},
                            tables: tableIndexes,
                            relations,
                            afterRelations,
                            data: [],
                            afterData,
                            verification: [],
                        },
                    };
                }
            }
            const ordered = diagnostic.sort(allDiagnostics);
            const errors = ordered.filter((item) => item.severity === 'error');
            const warnings = diagnostic.sort(ordered.filter((item) => item.severity === 'warning'));
            if (errors.length > 0 || !physical) throw createError(errors, warnings);
            const effective = {
                fingerprint: fingerprint.exec({value: analyzed.model}),
                model: analyzed.model,
                provenance: analyzed.provenance,
            };
            const fingerprintValue = fingerprint.exec({value: {model: analyzed.model, physical}});
            const result = resultFactory.create({
                effective,
                fingerprint: fingerprintValue,
                graph: analyzed.graph,
                model: analyzed.model,
                physical,
                provenance: analyzed.provenance,
                requirements: [...requirements].sort(),
                warnings,
            });
            successful.add(result);
            return result;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        decodeV2: 'TeqFw_Db_Back_Dem_Compile_A_DecodeV2$',
        compose: 'TeqFw_Db_Back_Dem_Compile_A_Compose$',
        mapRefs: 'TeqFw_Db_Back_Dem_Compile_A_MapRefs$',
        validate: 'TeqFw_Db_Back_Dem_Compile_A_Validate$',
        validateNames: 'TeqFw_Db_Back_Dem_Compile_A_ValidateNames$',
        graph: 'TeqFw_Db_Back_Dem_Compile_A_Graph$',
        fingerprint: 'TeqFw_Db_Back_Dem_Compile_A_Fingerprint$',
        diagnostic: 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory$',
        resultFactory: 'TeqFw_Db_Back_Dto_Dem_Compile_Result__Factory$',
    }),
});
