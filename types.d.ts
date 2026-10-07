import type {Knex} from 'knex';
export type DbCycleStrategy = Readonly<Record<string, unknown>>;
export type DbDirection = 'asc' | 'desc';
export type DbExecutionOptions = Readonly<Record<string, string | number | boolean>>;
export type DbExpression = DbAttributeExpression | DbValueExpression | DbCallExpression;
export type DbNamedConfigs = Readonly<Record<string, DbConfig>>;
export type DbOperationStatus = 'running' | 'complete' | 'failed';
export type DbRebuildMode = 'inPlace' | 'parallel';
export type DbRow = Readonly<Record<string, unknown>>;
export type DbSchemaApplicationStatus = 'started' | 'applied' | 'failed';
export type DbSchemaPhase = 'preflight' | 'dropRelations' | 'dropTables' | 'tables' | 'constraints' | 'relations' | 'data' | 'afterRelations' | 'afterData';
export type DbTransactionOutcome = 'notStarted' | 'started' | 'committed' | 'rolledBack' | 'rollbackFailed' | 'externalUnchanged';
export type DemDiagnosticSeverity = 'error' | 'warning';
export type DemDiagnosticStage = 'parse' | 'decode' | 'composition' | 'logical' | 'graph' | 'dialect' | 'preflight' | 'plan' | 'query';
export type DemProvenance = Readonly<Record<string, readonly DemSource[]>>;

export interface DbDtoFactory<T = Readonly<Record<string, unknown>>> { create(data?: unknown): T; }

export interface DbConfig extends Readonly<Knex.Config> {}

export interface DbTransaction {
    commit(): Promise<void>;
    createQuery(): Knex.QueryBuilder;
    disconnect(): Promise<void>;
    getDialectAdapter(): DbDialectAdapter;
    getKnexTrx(): Knex.Transaction;
    getTableName(meta: DbEntitySchema): string;
    isMariaDB(): boolean;
    isPostgres(): boolean;
    isSqlite(): boolean;
    raw(expression: string, bindings?: readonly unknown[]): Knex.Raw;
    rollback(): Promise<void>;
}

export interface DbConnection {
    disconnect(): Promise<void>;
    getDialectAdapter(): DbDialectAdapter;
    getClient(): Knex;
    getSchemaBuilder(): Knex.SchemaBuilder;
    startTransaction(options?: unknown): Promise<DbTransaction>;
}

export interface DbEntitySchema {
    createDto(data?: unknown): object;
    getAttributes(): Readonly<Record<string, unknown>>;
    getColumns(): Readonly<Record<string, string>>;
    getEntityName(): string;
    getId(): string | readonly string[];
    getTableName(): string;
}

export interface DbLogicalType { readonly id: string; readonly params?: Readonly<Record<string, unknown>>; }
export interface DbAttributeExpression { readonly kind: 'attr'; readonly name: string; }
export interface DbValueExpression { readonly kind: 'value'; readonly value: unknown; readonly type?: DbLogicalType; }
export interface DbCallExpression { readonly kind: 'call'; readonly operator: string; readonly args: readonly DbExpression[]; }
export interface DbProjection { readonly as: string; readonly expression: DbExpression; }
export interface DbOrdering { readonly direction: DbDirection; readonly expression: DbExpression; }
export interface DbPagination { readonly limit?: number; readonly offset?: number; }
export interface DbSelectionV2 extends DbPagination {
    readonly version: 2;
    readonly where?: DbExpression;
    readonly select?: readonly DbProjection[];
    readonly orderBy?: readonly DbOrdering[];
    readonly execution?: Readonly<Record<string, unknown>>;
}
export interface DemAttribute { type: DbLogicalType; nullable: boolean; comment?: string; storage?: Record<string, {type: string; params: Record<string, unknown>}>; default?: {kind: string; name?: string; value?: unknown}; generation?: DbGeneration; }
export interface DemRelation { attrs: string[]; ref: {path: string; attrs: string[]}; action: {delete?: string; update?: string}; deferrable: string; }
export interface DemIndex { kind: string; keys: {attr?: string; expression?: DbExpression; operatorClass?: string; order?: string; nulls?: string}[]; method?: string; options: Record<string, number>; include: string[]; predicate?: DbExpression; phase: string; }
export interface DemEntity { attr: Record<string, DemAttribute>; relation: Record<string, DemRelation>; index: Record<string, DemIndex>; comment?: string; }
export interface DemContainer { entity: Record<string, DemEntity>; package: Record<string, DemContainer>; }
export interface DemModel extends DemContainer { version: 2; namespace: string; requires: string[]; deprecated: Record<string, string[]>; }
export interface DbSchemaVerification { readonly kind: string; readonly name: string; }
export interface DbDropTable { readonly deprecated: boolean; readonly entity: string; readonly name: string; }
export interface DbSchemaTable { readonly table: DemPhysicalTable; readonly constraints: readonly DemPhysicalIndex[]; }
export interface DbSchemaPlanBase { readonly adapter: string; readonly fingerprint: string; readonly operation: 'create' | 'drop' | 'rebuild' | 'transfer'; }
export interface DbSchemaDropPlan extends DbSchemaPlanBase { readonly operation: 'drop'; readonly phases: {readonly preflight: {readonly requirements: readonly string[]}; readonly tables: readonly DbDropTable[]; readonly relations: readonly DemPhysicalRelation[]; readonly verification: readonly DbSchemaVerification[]}; }
export interface DbSchemaBuildPlan extends DbSchemaPlanBase { readonly operation: 'create' | 'rebuild' | 'transfer'; readonly phases: {readonly preflight: {readonly requirements: readonly string[]}; readonly tables: readonly DbSchemaTable[]; readonly relations: readonly DemPhysicalRelation[]; readonly afterRelations: readonly DemPhysicalIndex[]; readonly afterData: readonly DemPhysicalIndex[]; readonly data: readonly unknown[]; readonly verification: readonly DbSchemaVerification[]}; }
export interface DemSource { readonly fragmentId: string; readonly filename: string; readonly sourcePointer: string; readonly packageName?: string; readonly revision?: string; }
export interface DemFragmentEnvelope { readonly fragmentId: string; readonly filename: string; readonly packageName: string; readonly declaration: unknown; }
export interface DemMapEnvelope { readonly filename?: string; readonly declaration: unknown; }
export interface DemDiagnostic { readonly code: string; readonly details: Readonly<Record<string, unknown>>; readonly message: string; readonly path: string; readonly severity: DemDiagnosticSeverity; readonly sources: readonly DemSource[]; readonly stage: DemDiagnosticStage; }
export interface DemGraphEdge { readonly from: string; readonly to: string; readonly relation: string; readonly path: string; readonly deferrable?: string; readonly sources: readonly DemSource[]; }
export interface DemGraphCycle { readonly entities: readonly string[]; readonly relations: readonly DemGraphEdge[]; }
export interface DemGraph { readonly entities: readonly string[]; readonly topological: readonly string[]; readonly cycles: readonly DemGraphCycle[]; readonly edges: readonly DemGraphEdge[]; }
export interface DemPhysicalPlan { readonly adapter: string; readonly namespace?: string; readonly registryVersions: Readonly<Record<string, unknown>>; readonly tables: readonly DemPhysicalTable[]; readonly phases: DemPhysicalPhases; }
export interface DemPhysicalIndex { readonly entity: string; readonly kind: string; readonly name: string; readonly method?: string; readonly keys: readonly Readonly<{attr?: string; expression?: DbExpression; operatorClass?: string}>[]; readonly options: Readonly<Record<string, number>>; readonly predicate?: DbExpression; readonly include?: readonly string[]; }
export type DbPhysicalType = {readonly dialect: string; readonly unsigned: boolean} & (
    {readonly type: 'binary' | 'string' | 'vector' | 'halfvec' | 'sparsevec' | 'bit'; readonly args?: readonly [number?]}
    | {readonly type: 'datetime'; readonly args?: readonly [Readonly<{precision?: number; useTz?: boolean}>?]}
    | {readonly type: 'decimal'; readonly args?: readonly [number?, number?]}
    | {readonly type: 'enum'; readonly args: readonly [readonly string[]]}
    | {readonly type: 'boolean' | 'date' | 'increments' | 'integer' | 'json' | 'jsonb' | 'smallint' | 'text' | 'tinyint' | 'uuid' | 'bigint'; readonly args?: readonly []}
);
export type DbPhysicalDefault = {readonly kind: 'literal'; readonly value: Knex.Value} | {readonly kind: 'function'; readonly implementation: string; readonly name: string};
export interface DemPhysicalRelation { readonly entity: string; readonly name: string; readonly columns: readonly string[]; readonly referencedColumns: readonly string[]; readonly referencedTable: string; readonly table: string; readonly action?: Readonly<{delete?: string; update?: string}>; readonly deferrable?: 'deferred' | 'immediate' | 'notDeferrable'; }
export interface DemPhysicalPhases { readonly tables: readonly DemPhysicalIndex[]; readonly preflight: Readonly<{requirements: readonly string[]}>; readonly relations: readonly DemPhysicalRelation[]; readonly afterRelations: readonly DemPhysicalIndex[]; readonly data: readonly unknown[]; readonly afterData: readonly DemPhysicalIndex[]; readonly verification: readonly DbSchemaVerification[]; }
export interface DemPhysicalTable { readonly entity: string; readonly name: string; readonly comment?: string; readonly columns: readonly DemPhysicalColumn[]; }
export interface DemPhysicalColumn { readonly name: string; readonly logicalType: DbLogicalType; readonly comment?: string; readonly physicalType: DbPhysicalType; readonly nullable: boolean; readonly defaultValue?: DbPhysicalDefault; readonly generation?: DbGeneration; readonly requirements: readonly string[]; }
export interface DemEffectiveModel { readonly fingerprint: string; readonly model: DemModel; readonly provenance: DemProvenance; }
export interface DemCompilationResult { readonly effective: DemEffectiveModel; readonly fingerprint: string; readonly graph: DemGraph; readonly model: DemModel; readonly physical: DemPhysicalPlan; readonly provenance: DemProvenance; readonly requirements: readonly string[]; readonly warnings: readonly DemDiagnostic[]; }
export interface DemCompiler { exec(input: {readonly fragments: readonly DemFragmentEnvelope[]; readonly mapEnvelope: DemMapEnvelope; readonly adapter: DbDialectAdapter}): Promise<DemCompilationResult>; assertResult(input: {readonly value: unknown}): DemCompilationResult; }

export interface DbDialectDescription { readonly id: string; readonly family?: string; readonly capabilities?: readonly string[]; readonly [key: string]: unknown; }
export interface DbCapabilityPreflight { readonly operation: string; readonly requirements: readonly string[]; readonly fingerprint: string; readonly connection: DbConnection | DbTransaction; }
export interface DbValueCodec { encode(value: unknown): unknown; decode(value: unknown): unknown; }
export interface DbTypedOperator { readonly id: string; readonly arity: number | readonly number[]; readonly contexts: readonly string[]; readonly result: DbLogicalType; }
export interface DbSchemaOperation { readonly identity: string; readonly phase: DbSchemaPhase; readonly entity?: string; readonly required?: boolean; readonly payload?: unknown; }
export type DbSchemaPlan = DbSchemaDropPlan | DbSchemaBuildPlan;
export interface DbSchemaExecutionEvidence { readonly status: 'complete' | 'failed'; readonly phases: readonly DbLateIndexOutcome[]; readonly failure?: DbOperationFailure; }
export interface DbAdapterDiagnostic { readonly code: string; readonly message: string; readonly details: Readonly<Record<string, unknown>>; readonly severity?: DemDiagnosticSeverity; readonly stage?: DemDiagnosticStage; readonly path?: string; readonly sources?: readonly DemSource[]; }
export interface DbPreflightResult { readonly diagnostics: readonly DbAdapterDiagnostic[]; readonly [key: string]: unknown; }
export interface DbResolution<T = unknown> { readonly diagnostics?: readonly DemDiagnostic[]; readonly requirements?: readonly string[]; readonly descriptor?: T; readonly physicalType?: T; readonly compatibilitySignature?: string; }
export interface DbDialectAdapter {
    describe(): DbDialectDescription | Promise<DbDialectDescription>;
    resolveType(input: Readonly<Record<string, unknown>>): DbResolution | Promise<DbResolution>;
    resolveDefault(input: Readonly<Record<string, unknown>>): DbResolution | Promise<DbResolution>;
    resolveGeneration(input: Readonly<Record<string, unknown>>): DbResolution | Promise<DbResolution>;
    resolveIndex(input: Readonly<Record<string, unknown>>): DbResolution | Promise<DbResolution>;
    resolveRelation(input: Readonly<Record<string, unknown>>): DbResolution | Promise<DbResolution>;
    resolveOperator(input: Readonly<Record<string, unknown>>): DbResolution | Promise<DbResolution>;
    preflight(input: Readonly<Record<string, unknown>>): Promise<DbPreflightResult>;
    addColumn(input: Readonly<Record<string, unknown>>): unknown;
    addConstraint(input: Readonly<Record<string, unknown>>): unknown;
    addRelation(input: Readonly<Record<string, unknown>>): unknown;
    addIndex(input: Readonly<Record<string, unknown>>): Promise<void>;
    dropRelation(input: Readonly<Record<string, unknown>>): unknown;
    compileExpression(input: Readonly<Record<string, unknown>>): unknown;
    applyExecutionOptions(input: Readonly<Record<string, unknown>>): Promise<void>;
    prepareTransfer(input: Readonly<Record<string, unknown>>): Promise<Readonly<Record<string, unknown>>>;
    restoreGeneratedState(input: Readonly<Record<string, unknown>>): Promise<readonly unknown[]>;
    encodeValue(input: Readonly<Record<string, unknown>>): unknown;
    decodeValue(input: Readonly<Record<string, unknown>>): unknown;
    validateCycleStrategy(input: {readonly cycles: readonly DemGraphCycle[]; readonly strategy?: DbCycleStrategy | null}): {readonly valid: boolean; readonly requirements?: readonly string[]; readonly diagnostics?: readonly DemDiagnostic[]};
}

export interface DbSnapshotReader { readTable(input: {readonly entity: string; readonly table: string}): Promise<readonly DbRow[]> | readonly DbRow[]; }
export interface DbTransformation { readonly id: string; exec(input: {readonly entity: string; readonly row: DbRow}): Promise<DbRow> | DbRow; }
export interface DbRebuildInput { readonly mode: DbRebuildMode; readonly compilation: DemCompilationResult; readonly sourceCompilation?: DemCompilationResult; readonly source: DbConnection; readonly target: DbConnection; readonly sourceId: string; readonly targetId: string; readonly snapshot?: DbSnapshotReader; readonly authorizeDiscard?: boolean; readonly transformations?: Readonly<Record<string, DbTransformation>>; readonly sourceTransaction?: DbTransaction; readonly targetTransaction?: DbTransaction; readonly cycleStrategy?: DbCycleStrategy; }
export interface DbOperationFailure { readonly entity?: string | null; readonly message: string; readonly name: string; readonly stage: string; }
export interface DbTableEvidence { readonly entity: string; readonly table: string; readonly status: string; readonly sourceRows?: number; readonly targetRows?: number; readonly transformation?: string; readonly error?: Readonly<{name: string; message: string}>; }
export interface DbLateIndexOutcome { readonly identity: string; readonly phase: string; readonly status: string; }
export interface DbRebuildEvidence {
    readonly accepted: boolean;
    readonly dataComplete: boolean;
    readonly failures: readonly DbOperationFailure[];
    readonly fingerprint: string;
    readonly generatedState: readonly unknown[];
    readonly identityCounters?: readonly DbIdentityCounterEvidence[];
    readonly mode: DbRebuildMode;
    readonly mutationStarted: boolean;
    readonly phases: readonly DbLateIndexOutcome[];
    readonly preservation: Readonly<{authorizedDiscard: boolean; status: 'notStarted' | 'verifiedReadable' | 'discardAuthorized' | 'notRequired'; tables: readonly Readonly<{entity: string; table: string; rows: number}>[]}>;
    readonly preflight: Readonly<Record<string, DbPreflightResult>>;
    readonly source: Readonly<{adapter: string; fingerprint: string; id: string}>;
    readonly status: DbOperationStatus;
    readonly strategy: Readonly<Record<string, unknown>> | null;
    readonly tables: readonly DbTableEvidence[];
    readonly target: Readonly<{adapter: string; fingerprint: string; id: string}>;
    readonly transaction: Readonly<{owned: boolean; outcome: DbTransactionOutcome}>;
    readonly transformations: readonly Readonly<{entity: string; id: string}>[];
}
export interface DbRebuild { exec(input: DbRebuildInput): Promise<DbRebuildEvidence>; }

export interface DbGeneration { readonly kind: string; readonly implementation?: string; readonly params?: Readonly<{mode?: 'byDefault' | 'allocated' | 'always'}>; }
export interface DbIdentityInput { readonly compilation: DemCompilationResult; readonly transaction: DbTransaction; readonly entity: string; }
export interface DbIdentitySyncInput { readonly compilation: DemCompilationResult; readonly transaction: DbTransaction; }
export interface DbIdentityCounterEvidence { readonly entity: string; readonly value: number; }
export interface DbIdentity {
    allocate(input: DbIdentityInput): Promise<number>;
    synchronize(input: DbIdentitySyncInput): Promise<readonly DbIdentityCounterEvidence[]>;
}
export interface DbEffectiveSnapshot { readonly id: number; readonly fingerprint: string; readonly dem: Readonly<Record<string, unknown>>; readonly provenance: DemProvenance; readonly createdAt: string; }
export interface DbSchemaApplication { readonly id: number; readonly sourceSnapshotId: number | null; readonly targetSnapshotId: number; readonly status: DbSchemaApplicationStatus; readonly startedAt: string; readonly completedAt: string | null; }
export interface DbCatalogDiagnostic { readonly code: string; readonly details: Readonly<Record<string, unknown>>; }
export interface DbCatalogValidation { readonly matches: boolean; readonly diagnostics: readonly DbCatalogDiagnostic[]; }
export interface DbHistory {
    recordSnapshot(input: {readonly compilation: DemCompilationResult; readonly connection: DbConnection; readonly transaction?: DbTransaction}): Promise<DbEffectiveSnapshot>;
    startApplication(input: {readonly compilation: DemCompilationResult; readonly connection: DbConnection; readonly sourceSnapshotId?: number | null; readonly targetSnapshotId: number; readonly transaction?: DbTransaction}): Promise<DbSchemaApplication>;
    validateCatalog(input: {readonly compilation: DemCompilationResult; readonly connection: DbConnection}): Promise<DbCatalogValidation>;
    completeApplication(input: {readonly applicationId: number; readonly compilation: DemCompilationResult; readonly connection: DbConnection; readonly transaction?: DbTransaction}): Promise<DbSchemaApplication>;
    failApplication(input: {readonly applicationId: number; readonly compilation: DemCompilationResult; readonly connection: DbConnection; readonly transaction?: DbTransaction}): Promise<DbSchemaApplication>;
    resolveLastApplied(input: {readonly compilation: DemCompilationResult; readonly connection: DbConnection; readonly transaction?: DbTransaction}): Promise<Readonly<{application: DbSchemaApplication; snapshot: DbEffectiveSnapshot}> | null>;
}
declare global {
    type TeqFw_Db_NormalizedCoreType =
        {id: 'core.binary'; params: {length?: number}} |
        {id: 'core.datetime'; params: {timezone: boolean; precision?: number}} |
        {id: 'core.decimal'; params: {precision: number; scale: number; unsigned: boolean}} |
        {id: 'core.enum'; params: {values: string[]}} |
        {id: 'core.integer'; params: {bits: 8 | 16 | 32 | 64; unsigned: boolean}} |
        {id: 'core.string'; params: {length: number}} |
        {id: 'core.vector'; params: {dimensions: number; element: 'bit' | 'float'; sparse: boolean}} |
        {id: 'core.any' | 'core.boolean' | 'core.date' | 'core.identity' | 'core.json' | 'core.ref' | 'core.text' | 'core.uuid'; params: Record<string, never>};
    type TeqFw_Db_NormalizedCoreTypeNullable = TeqFw_Db_NormalizedCoreType | null;

    type TeqFw_Db_PaginationFields = readonly ('limit' | 'offset')[];
    type TeqFw_Db_ExpressionKind = 'attr' | 'value' | 'call';
    type TeqFw_Db_LogicalTypeOptional = DbLogicalType | undefined;
    type TeqFw_Db_QueryExpressionArrayOptional = readonly DbExpression[] | undefined;
    type TeqFw_Db_ExpressionSchema = {compatibilityUntyped?: boolean; attr?: Record<string, {name?: string; column?: string; type?: DbLogicalType; logicalType?: DbLogicalType}>; columns?: readonly DemPhysicalColumn[]; mapColumn?: (name: string) => string | undefined};
    type TeqFw_Db_ExpressionContext = 'filter' | 'projection' | 'ordering' | 'index' | 'predicate';

    type TeqFw_Db_IntegerBits = 8 | 16 | 32 | 64;
    type TeqFw_Db_StorageTypeSelector = string | ((logicalType: TeqFw_Db_CanonicalLogicalType) => string);

    type TeqFw_Db_PreflightInput = DbCapabilityPreflight;
    type TeqFw_Db_CanonicalLogicalType = {id: string; params: Record<string, unknown>};
    type TeqFw_Db_TypeResolutionInput = {logicalType: TeqFw_Db_CanonicalLogicalType; storage?: {type: string; params?: Record<string, unknown>}};
    type TeqFw_Db_TypeProjectionInput = {logicalType: TeqFw_Db_CanonicalLogicalType; binding?: {type: string; params?: Record<string, unknown>}};
    type TeqFw_Db_DefaultResolutionInput = {defaultValue: {kind: string; value?: unknown; name?: string}; logicalType: TeqFw_Db_CanonicalLogicalType};
    type TeqFw_Db_GenerationResolutionInput = {generation: DbGeneration; logicalType: TeqFw_Db_CanonicalLogicalType};
    type TeqFw_Db_RelationResolutionInput = {relation: DemRelation};
    type TeqFw_Db_OperatorInput = {operator: string};
    type TeqFw_Db_OperatorContract = {arity: number | {min: number}; args: string | readonly string[]; result: string; contexts: string[]};
    type TeqFw_Db_ValueInput = {column: DemPhysicalColumn; value: unknown};
    type TeqFw_Db_IndexExecutionInput = {connection: DbConnection; index: DemPhysicalIndex; knex: Knex | Knex.Transaction; table: DemPhysicalTable};
    type TeqFw_Db_ExecutionInput = {execution: DbExecutionOptions; knex?: Knex | Knex.Transaction};

    type TeqFw_Db_FailureDetails = {message: string; name: string; phases: DbLateIndexOutcome[]};

    type TeqFw_Db_ExportTable = {name: string; columns: readonly {name: string; type?: unknown}[]};

    type TeqFw_Db_SqlBinding = string | number | boolean | null | Knex.Raw;
    type TeqFw_Db_VectorProjection = {diagnostics: DbAdapterDiagnostic[]; physicalType?: {args: number[]; dialect: string; type: string; unsigned: boolean}};
    type TeqFw_Db_IndexProjection = {diagnostics: DbAdapterDiagnostic[]; descriptor?: {include: string[]; keys: {attr?: string; operatorClass?: string}[]; kind: string; method: string; name: string; options: Record<string, number>; predicate?: DbExpression; requirements: string[]}};

    type TeqFw_Db_VectorStorageRule = {capability: string; maxDimensions: number; element: string; sparse: boolean};
    type TeqFw_Db_VectorOperatorClass = {methods: string[]; physical: string; storage: string};
    type TeqFw_Db_VectorOperator = {implementation: string; physical: string; storage: string[]};
    type TeqFw_Db_NumberRangeMap = Record<string, readonly [number, number]>;
    type TeqFw_Db_VectorStorageInput = {binding: {params?: Record<string, unknown>}; logicalType: DbLogicalType};
    type TeqFw_Db_VectorIndexInput = {entity: DemEntity; index: DemIndex; physicalName: string};
    type TeqFw_Db_VectorValue = string | number[] | {dimensions: number; entries: {index: number; value: number}[]};

    type TeqFw_Db_PreflightFunction = (input: DbCapabilityPreflight) => Promise<DbPreflightResult & {availableCapabilities?: readonly string[]}>;
    type TeqFw_Db_PreflightConnection = DbConnection | DbTransaction;
    type TeqFw_Db_KnexProvider = {getClient?: () => Knex; getKnex?: () => Knex; getKnexTrx?: () => Knex.Transaction};
    type TeqFw_Db_AddColumnFunction = (input: {column: DemPhysicalColumn; knex: Knex | Knex.Transaction; tableBuilder: Knex.CreateTableBuilder}) => unknown;
    type TeqFw_Db_AddIndexFunction = (input: {connection: DbConnection; index: DemPhysicalIndex; knex: Knex | Knex.Transaction; table: DemPhysicalTable}) => Promise<void>;

    type TeqFw_Db_OperatorDescriptor = {operator: string; physical: string};
    type TeqFw_Db_ExecutionSetting = {maximum: number; minimum: number; setting: string};

    type TeqFw_Db_ProjectionDiagnosticArray = readonly {code?: string; details?: Record<string, unknown>; message?: string; path?: string; severity?: DemDiagnosticSeverity; sources?: readonly DemSource[]; stage?: DemDiagnosticStage}[];
    type TeqFw_Db_SchemaExecutionPhase = {identity: string; phase: string; status: string; evidence?: unknown; error?: {message: string; name: string}};
    type TeqFw_Db_PhysicalColumnDraft = {name: string; logicalType: DbLogicalType; physicalType: DbPhysicalType; nullable: boolean; comment?: string; defaultValue?: DbPhysicalDefault; generation?: DbGeneration; requirements: string[]};
    type TeqFw_Db_PhysicalTableDraft = {entity: string; name: string; comment?: string; columns: TeqFw_Db_PhysicalColumnDraft[]};


    type TeqFw_Db_PhysicalTableArray = readonly DemPhysicalTable[];
    type TeqFw_Db_SchemaExecutionEvidence = {fingerprint: string; operation: string; phases: readonly DbLateIndexOutcome[]; preflight: DbPreflightResult; status: 'complete'};

    type TeqFw_Db_StringNullable = string | null;

    type TeqFw_Db_RebuildMode = DbRebuildMode;
    type TeqFw_Db_SnapshotReaderOptional = DbSnapshotReader | undefined;
    type TeqFw_Db_TransformationMap = Readonly<Record<string, DbTransformation>>;
    type TeqFw_Db_Transformation = DbTransformation;
    type TeqFw_Db_LateSchemaPhase = 'afterRelations' | 'afterData';
    type TeqFw_Db_RebuildEvidenceDraft = {
        accepted: boolean; dataComplete: boolean; failures: DbOperationFailure[];
        fingerprint: string; generatedState: readonly unknown[]; identityCounters: readonly DbIdentityCounterEvidence[];
        mode: DbRebuildMode; mutationStarted: boolean; phases: DbLateIndexOutcome[];
        preservation: {authorizedDiscard: boolean; status: 'notStarted' | 'verifiedReadable' | 'discardAuthorized' | 'notRequired'; tables: {entity: string; table: string; rows: number}[]};
        preflight: Record<string, DbPreflightResult>; source: {adapter: string; fingerprint: string; id: string};
        status: DbOperationStatus; strategy: Readonly<Record<string, unknown>> | null;
        tables: {entity: string; table: string; status: string; sourceRows?: number; targetRows?: number; transformation?: string; error?: {name: string; message: string}}[];
        target: {adapter: string; fingerprint: string; id: string}; transaction: {owned: boolean; outcome: DbTransactionOutcome};
        transformations: {entity: string; id: string}[];
    };

    type TeqFw_Db_Model = DemModel;
    type TeqFw_Db_EffectiveModel = DemEffectiveModel;
    type TeqFw_Db_Provenance = DemProvenance;
    type TeqFw_Db_PhysicalPlan = DemPhysicalPlan;
    type TeqFw_Db_SchemaPlan = DbSchemaPlan;
    type TeqFw_Db_CycleStrategyNullable = DbCycleStrategy | null;
    type TeqFw_Db_SchemaOperation = 'create' | 'drop' | 'rebuild' | 'transfer';
    type TeqFw_Db_DropTableArray = readonly DbDropTable[];
    type TeqFw_Db_PhysicalIndexArray = DemPhysicalIndex[];
    type TeqFw_Db_GraphEdges = DemGraphEdge[];
    type TeqFw_Db_StringLists = string[][];

    type TeqFw_Db_DiagnosticStage = DemDiagnosticStage;
    type TeqFw_Db_CycleValidation = {valid: boolean; requirements?: readonly string[]; diagnostics?: readonly DemDiagnostic[]};
    type TeqFw_Db_CycleValidationInput = {cycles: readonly DemGraphCycle[]; strategy?: DbCycleStrategy | null};

    type TeqFw_Db_DiagnosticSeverity = DemDiagnosticSeverity;
    type TeqFw_Db_MutableSourceArray = DemSource[];
    type TeqFw_Db_LegacySerialSchema = PromiseLike<{rows: {nextval: string | number}[]}> & {raw(sql: string): unknown};
    type TeqFw_Db_SourceArray = readonly DemSource[];
    type TeqFw_Db_Graph = DemGraph;
    type TeqFw_Db_GraphEdgeArray = readonly DemGraphEdge[];
    type TeqFw_Db_GraphCycleArray = readonly DemGraphCycle[];
    type TeqFw_Db_KnexTableBuilder = Knex.CreateTableBuilder;
    type TeqFw_Db_PhysicalIndex = DemPhysicalIndex;
    type TeqFw_Db_PhysicalRelation = DemPhysicalRelation;
    type TeqFw_Db_ExpressionDescriptor = {implementation: string; operator?: string; physical?: string};
    type TeqFw_Db_SqlArguments = readonly Knex.Raw[];

    type TeqFw_Db_GeneratedStateEvidenceArray = readonly unknown[];
    type TeqFw_Db_TransferStrategyEvidence = Readonly<Record<string, unknown>> | null;
    type TeqFw_Db_SchemaDataTransfer = () => Promise<unknown>;
    type TeqFw_Db_PhysicalColumnArray = DemPhysicalColumn[];
    type TeqFw_Db_PhysicalTableOptional = DemPhysicalTable | undefined;
    type TeqFw_Db_IdentityCounterEvidenceArray = readonly DbIdentityCounterEvidence[];
    type TeqFw_Db_Release = () => void;
    type TeqFw_Db_HistoryWriteResult = DbEffectiveSnapshot | DbSchemaApplication;
    type TeqFw_Db_HistoryWriteAction = (transaction: DbTransaction | undefined) => Promise<TeqFw_Db_HistoryWriteResult>;
    type TeqFw_Db_NumberNullable = number | null;
    type TeqFw_Db_QueryBindings = readonly unknown[];
    type TeqFw_Db_CatalogConnection = Pick<DbConnection, 'getClient' | 'getSchemaBuilder'>;
    type TeqFw_Db_DialectAdapter = DbDialectAdapter;
    type TeqFw_Db_KnexSchema = Knex.SchemaBuilder;
    type TeqFw_Db_KnexQuery = Knex.QueryBuilder;
    type TeqFw_Db_KnexRaw = Knex.Raw;
    type TeqFw_Db_TransactionOptions = Knex.TransactionConfig;
    type TeqFw_Db_Transaction = DbTransaction;
    type TeqFw_Db_Connection = DbConnection;
    type TeqFw_Db_HistoryWriteInput = {compilation: DemCompilationResult; connection: DbConnection; transaction?: DbTransaction; entity: string};
    type TeqFw_Db_SqliteAllocatedColumnInput = {column: DemPhysicalColumn & {readonly comment?: string; readonly physicalType: {readonly type: string}}; tableBuilder: Knex.CreateTableBuilder; knex: Knex};
    type TeqFw_Db_DemCompilationResult = DemCompilationResult;
    type TeqFw_Db_DemCompiler = DemCompiler;
    type TeqFw_Db_PhysicalTable = DemPhysicalTable;
    type TeqFw_Db_PhysicalColumn = DemPhysicalColumn;
    type TeqFw_Db_IdentityInput = DbIdentityInput;
    type TeqFw_Db_IdentitySyncInput = DbIdentitySyncInput;
    type TeqFw_Db_IdentityCounterEvidence = DbIdentityCounterEvidence;
    type TeqFw_Db_IdentityCounterRow = {scope: string; entity_path: string; value: unknown};
    type TeqFw_Db_KnexTransaction = Knex.Transaction;
    type TeqFw_Db_KnexQuerySource = Knex | Knex.Transaction;

    type TeqFw_Db_Back_RDb_Identity = import('./src/Back/RDb/Identity.mjs').default;
    type TeqFw_Db_Back_RDb_Identity__Class = typeof import('./src/Back/RDb/Identity.mjs').default;
    type TeqFw_Cfg_Reader = {get: any};
    type TeqFw_Db_Back_Act_Dem_RdbTables = import("./src/Back/Act/Dem/RdbTables.mjs").default;
    type TeqFw_Db_Back_Act_Dem_RdbTables__Class = typeof import("./src/Back/Act/Dem/RdbTables.mjs").default;
    type TeqFw_Db_Back_Act_Dem_Tables = import("./src/Back/Act/Dem/Tables.mjs").default;
    type TeqFw_Db_Back_Act_Dem_Tables__Class = typeof import("./src/Back/Act/Dem/Tables.mjs").default;
    type TeqFw_Db_Back_Api_Import_Transform = import("./src/Back/Api/Import/Transform.mjs").default;
    type TeqFw_Db_Back_Api_Import_Transform__Class = typeof import("./src/Back/Api/Import/Transform.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Dialect = import("./src/Back/Api/RDb/Dialect.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Dialect__Class = typeof import("./src/Back/Api/RDb/Dialect.mjs").default;
    type TeqFw_Db_Back_Api_RDb_History = import("./src/Back/Api/RDb/History.mjs").default;
    type TeqFw_Db_Back_Api_RDb_History__Class = typeof import("./src/Back/Api/RDb/History.mjs").default;
    type TeqFw_Db_Back_Api_RDb_QueryBuilder = import("./src/Back/Api/RDb/QueryBuilder.mjs").default;
    type TeqFw_Db_Back_Api_RDb_QueryBuilder__Class = typeof import("./src/Back/Api/RDb/QueryBuilder.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Query_List = import("./src/Back/Api/RDb/Query/List.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Query_List__Class = typeof import("./src/Back/Api/RDb/Query/List.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Rebuild = import("./src/Back/Api/RDb/Rebuild.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Rebuild__Class = typeof import("./src/Back/Api/RDb/Rebuild.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Repository = import("./src/Back/Api/RDb/Repository.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Repository__Class = typeof import("./src/Back/Api/RDb/Repository.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Schema = import("./src/Back/Api/RDb/Schema.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Schema_Object = import("./src/Back/Api/RDb/Schema/Object.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Schema_Object__Class = typeof import("./src/Back/Api/RDb/Schema/Object.mjs").default;
    type TeqFw_Db_Back_Api_RDb_Schema__Class = typeof import("./src/Back/Api/RDb/Schema.mjs").default;
    type TeqFw_Db_Back_App_Shutdown = import("./src/Back/App/Shutdown.mjs").default;
    type TeqFw_Db_Back_App_Shutdown__Class = typeof import("./src/Back/App/Shutdown.mjs").default;
    type TeqFw_Db_Back_Cli_Drop = typeof import("./src/Back/Cli/Drop.mjs").default;
    type TeqFw_Db_Back_Cli_Dto_Command = import("./src/Back/Cli/Dto/Command.mjs").default;
    type TeqFw_Db_Back_Cli_Dto_Command_Option = import("./src/Back/Cli/Dto/Command/Option.mjs").default;
    type TeqFw_Db_Back_Cli_Dto_Command_Option__Class = typeof import("./src/Back/Cli/Dto/Command/Option.mjs").default;
    type TeqFw_Db_Back_Cli_Dto_Command_Option__Factory = import("./src/Back/Cli/Dto/Command/Option.mjs").Factory;
    type TeqFw_Db_Back_Cli_Dto_Command_Option__Factory__Class = typeof import("./src/Back/Cli/Dto/Command/Option.mjs").Factory;
    type TeqFw_Db_Back_Cli_Dto_Command__Class = typeof import("./src/Back/Cli/Dto/Command.mjs").default;
    type TeqFw_Db_Back_Cli_Dto_Command__Factory = import("./src/Back/Cli/Dto/Command.mjs").Factory;
    type TeqFw_Db_Back_Cli_Dto_Command__Factory__Class = typeof import("./src/Back/Cli/Dto/Command.mjs").Factory;
    type TeqFw_Db_Back_Cli_Export = typeof import("./src/Back/Cli/Export.mjs").default;
    type TeqFw_Db_Back_Cli_Export_A_Select = import("./src/Back/Cli/Export/A/Select.mjs").default;
    type TeqFw_Db_Back_Cli_Export_A_Select__Class = typeof import("./src/Back/Cli/Export/A/Select.mjs").default;
    type TeqFw_Db_Back_Cli_Import = typeof import("./src/Back/Cli/Import.mjs").default;
    type TeqFw_Db_Back_Cli_Init = typeof import("./src/Back/Cli/Init.mjs").default;
    type TeqFw_Db_Back_Config = import("./src/Back/Config.mjs").default;
    type TeqFw_Db_Back_Config__Class = typeof import("./src/Back/Config.mjs").default;
    type TeqFw_Db_Back_Defaults = import("./src/Back/Defaults.mjs").default;
    type TeqFw_Db_Back_Defaults__Class = typeof import("./src/Back/Defaults.mjs").default;
    type TeqFw_Db_Back_Dem_Compile = import("./src/Back/Dem/Compile.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Compose = import("./src/Back/Dem/Compile/A/Compose.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Compose__Class = typeof import("./src/Back/Dem/Compile/A/Compose.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_DecodeV2 = import("./src/Back/Dem/Compile/A/DecodeV2.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_DecodeV2__Class = typeof import("./src/Back/Dem/Compile/A/DecodeV2.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Fingerprint = import("./src/Back/Dem/Compile/A/Fingerprint.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Fingerprint__Class = typeof import("./src/Back/Dem/Compile/A/Fingerprint.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Graph = import("./src/Back/Dem/Compile/A/Graph.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Graph__Class = typeof import("./src/Back/Dem/Compile/A/Graph.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_MapRefs = import("./src/Back/Dem/Compile/A/MapRefs.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_MapRefs__Class = typeof import("./src/Back/Dem/Compile/A/MapRefs.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Validate = import("./src/Back/Dem/Compile/A/Validate.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_ValidateNames = import("./src/Back/Dem/Compile/A/ValidateNames.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_ValidateNames__Class = typeof import("./src/Back/Dem/Compile/A/ValidateNames.mjs").default;
    type TeqFw_Db_Back_Dem_Compile_A_Validate__Class = typeof import("./src/Back/Dem/Compile/A/Validate.mjs").default;
    type TeqFw_Db_Back_Dem_Compile__Class = typeof import("./src/Back/Dem/Compile.mjs").default;
    type TeqFw_Db_Back_Dem_Load = import("./src/Back/Dem/Load.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_Scan = import("./src/Back/Dem/Load/A/Scan.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem = import("./src/Back/Dem/Load/A/Scan/A/Dem.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem__Class = typeof import("./src/Back/Dem/Load/A/Scan/A/Dem.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Map = import("./src/Back/Dem/Load/A/Scan/A/Map.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Map__Class = typeof import("./src/Back/Dem/Load/A/Scan/A/Map.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_Scan__Class = typeof import("./src/Back/Dem/Load/A/Scan.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_SchemaCfg = import("./src/Back/Dem/Load/A/SchemaCfg.mjs").default;
    type TeqFw_Db_Back_Dem_Load_A_SchemaCfg__Class = typeof import("./src/Back/Dem/Load/A/SchemaCfg.mjs").default;
    type TeqFw_Db_Back_Dem_Load__Class = typeof import("./src/Back/Dem/Load.mjs").default;
    type TeqFw_Db_Back_Dem_Registry_Core = import("./src/Back/Dem/Registry/Core.mjs").default;
    type TeqFw_Db_Back_Dem_Registry_CoreValue = import("./src/Back/Dem/Registry/CoreValue.mjs").default;
    type TeqFw_Db_Back_Dem_Registry_CoreValue__Class = typeof import("./src/Back/Dem/Registry/CoreValue.mjs").default;
    type TeqFw_Db_Back_Dem_Registry_Core__Class = typeof import("./src/Back/Dem/Registry/Core.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Local = import("./src/Back/Dto/Config/Local.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Local_Connection = import("./src/Back/Dto/Config/Local/Connection.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Local_Connection__Class = typeof import("./src/Back/Dto/Config/Local/Connection.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Local_Connection__Factory = import("./src/Back/Dto/Config/Local/Connection.mjs").Factory;
    type TeqFw_Db_Back_Dto_Config_Local_Connection__Factory__Class = typeof import("./src/Back/Dto/Config/Local/Connection.mjs").Factory;
    type TeqFw_Db_Back_Dto_Config_Local__Class = typeof import("./src/Back/Dto/Config/Local.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Local__Factory = import("./src/Back/Dto/Config/Local.mjs").Factory;
    type TeqFw_Db_Back_Dto_Config_Local__Factory__Class = typeof import("./src/Back/Dto/Config/Local.mjs").Factory;
    type TeqFw_Db_Back_Dto_Config_Schema = import("./src/Back/Dto/Config/Schema.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Schema__Class = typeof import("./src/Back/Dto/Config/Schema.mjs").default;
    type TeqFw_Db_Back_Dto_Config_Schema__Factory = import("./src/Back/Dto/Config/Schema.mjs").Factory;
    type TeqFw_Db_Back_Dto_Config_Schema__Factory__Class = typeof import("./src/Back/Dto/Config/Schema.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem = import("./src/Back/Dto/Dem.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic = import("./src/Back/Dto/Dem/Compile/Diagnostic.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Class = typeof import("./src/Back/Dto/Dem/Compile/Diagnostic.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory = import("./src/Back/Dto/Dem/Compile/Diagnostic.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory__Class = typeof import("./src/Back/Dto/Dem/Compile/Diagnostic.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph = import("./src/Back/Dto/Dem/Compile/Graph.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph__Class = typeof import("./src/Back/Dto/Dem/Compile/Graph.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph__Factory = import("./src/Back/Dto/Dem/Compile/Graph.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph__Factory__Class = typeof import("./src/Back/Dto/Dem/Compile/Graph.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Result = import("./src/Back/Dto/Dem/Compile/Result.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Result__Class = typeof import("./src/Back/Dto/Dem/Compile/Result.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Result__Factory = import("./src/Back/Dto/Dem/Compile/Result.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Result__Factory__Class = typeof import("./src/Back/Dto/Dem/Compile/Result.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Source = import("./src/Back/Dto/Dem/Compile/Source.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Source__Class = typeof import("./src/Back/Dto/Dem/Compile/Source.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory = import("./src/Back/Dto/Dem/Compile/Source.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory__Class = typeof import("./src/Back/Dto/Dem/Compile/Source.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity = import("./src/Back/Dto/Dem/Entity.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr = import("./src/Back/Dto/Dem/Entity/Attr.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options = import("./src/Back/Dto/Dem/Entity/Attr/Options.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Class = typeof import("./src/Back/Dto/Dem/Entity/Attr/Options.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Factory = import("./src/Back/Dto/Dem/Entity/Attr/Options.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity/Attr/Options.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr__Class = typeof import("./src/Back/Dto/Dem/Entity/Attr.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr__Factory = import("./src/Back/Dto/Dem/Entity/Attr.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity/Attr.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Index = import("./src/Back/Dto/Dem/Entity/Index.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Index__Class = typeof import("./src/Back/Dto/Dem/Entity/Index.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Index__Factory = import("./src/Back/Dto/Dem/Entity/Index.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Index__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity/Index.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation = import("./src/Back/Dto/Dem/Entity/Relation.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action = import("./src/Back/Dto/Dem/Entity/Relation/Action.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Class = typeof import("./src/Back/Dto/Dem/Entity/Relation/Action.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Factory = import("./src/Back/Dto/Dem/Entity/Relation/Action.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity/Relation/Action.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref = import("./src/Back/Dto/Dem/Entity/Relation/Ref.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Class = typeof import("./src/Back/Dto/Dem/Entity/Relation/Ref.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Factory = import("./src/Back/Dto/Dem/Entity/Relation/Ref.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity/Relation/Ref.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation__Class = typeof import("./src/Back/Dto/Dem/Entity/Relation.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation__Factory = import("./src/Back/Dto/Dem/Entity/Relation.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity/Relation.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity__Class = typeof import("./src/Back/Dto/Dem/Entity.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Entity__Factory = import("./src/Back/Dto/Dem/Entity.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Entity__Factory__Class = typeof import("./src/Back/Dto/Dem/Entity.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Package = import("./src/Back/Dto/Dem/Package.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Package__Class = typeof import("./src/Back/Dto/Dem/Package.mjs").default;
    type TeqFw_Db_Back_Dto_Dem_Package__Factory = import("./src/Back/Dto/Dem/Package.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem_Package__Factory__Class = typeof import("./src/Back/Dto/Dem/Package.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem__Class = typeof import("./src/Back/Dto/Dem.mjs").default;
    type TeqFw_Db_Back_Dto_Dem__Factory = import("./src/Back/Dto/Dem.mjs").Factory;
    type TeqFw_Db_Back_Dto_Dem__Factory__Class = typeof import("./src/Back/Dto/Dem.mjs").Factory;
    type TeqFw_Db_Back_Dto_Export = import("./src/Back/Dto/Export.mjs").default;
    type TeqFw_Db_Back_Dto_Export__Class = typeof import("./src/Back/Dto/Export.mjs").default;
    type TeqFw_Db_Back_Dto_Map = import("./src/Back/Dto/Map.mjs").default;
    type TeqFw_Db_Back_Dto_Map_Ref = import("./src/Back/Dto/Map/Ref.mjs").default;
    type TeqFw_Db_Back_Dto_Map_Ref__Class = typeof import("./src/Back/Dto/Map/Ref.mjs").default;
    type TeqFw_Db_Back_Dto_Map_Ref__Factory = import("./src/Back/Dto/Map/Ref.mjs").Factory;
    type TeqFw_Db_Back_Dto_Map_Ref__Factory__Class = typeof import("./src/Back/Dto/Map/Ref.mjs").Factory;
    type TeqFw_Db_Back_Dto_Map__Class = typeof import("./src/Back/Dto/Map.mjs").default;
    type TeqFw_Db_Back_Dto_Map__Factory = import("./src/Back/Dto/Map.mjs").Factory;
    type TeqFw_Db_Back_Dto_Map__Factory__Class = typeof import("./src/Back/Dto/Map.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Column = import("./src/Back/Dto/RDb/Column.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Column__Class = typeof import("./src/Back/Dto/RDb/Column.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Column__Factory = import("./src/Back/Dto/RDb/Column.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Column__Factory__Class = typeof import("./src/Back/Dto/RDb/Column.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Index = import("./src/Back/Dto/RDb/Index.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Index__Class = typeof import("./src/Back/Dto/RDb/Index.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Index__Factory = import("./src/Back/Dto/RDb/Index.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Index__Factory__Class = typeof import("./src/Back/Dto/RDb/Index.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Relation = import("./src/Back/Dto/RDb/Relation.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Relation__Class = typeof import("./src/Back/Dto/RDb/Relation.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Relation__Factory = import("./src/Back/Dto/RDb/Relation.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Relation__Factory__Class = typeof import("./src/Back/Dto/RDb/Relation.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Table = import("./src/Back/Dto/RDb/Table.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Table__Class = typeof import("./src/Back/Dto/RDb/Table.mjs").default;
    type TeqFw_Db_Back_Dto_RDb_Table__Factory = import("./src/Back/Dto/RDb/Table.mjs").Factory;
    type TeqFw_Db_Back_Dto_RDb_Table__Factory__Class = typeof import("./src/Back/Dto/RDb/Table.mjs").Factory;
    type TeqFw_Db_Back_Enum_Db_Type_Action = typeof import("./src/Back/Enum/Db/Type/Action.mjs").default;
    type TeqFw_Db_Back_Enum_Db_Type_Column = typeof import("./src/Back/Enum/Db/Type/Column.mjs").default;
    type TeqFw_Db_Back_Enum_Db_Type_Index = typeof import("./src/Back/Enum/Db/Type/Index.mjs").default;
    type TeqFw_Db_Back_Enum_Dem_Type_Action = typeof import("./src/Back/Enum/Dem/Type/Action.mjs").default;
    type TeqFw_Db_Back_Enum_Dem_Type_Attr = typeof import("./src/Back/Enum/Dem/Type/Attr.mjs").default;
    type TeqFw_Db_Back_Enum_Dem_Type_Index = typeof import("./src/Back/Enum/Dem/Type/Index.mjs").default;
    type TeqFw_Db_Back_Mod_Expression = import("./src/Back/Mod/Expression.mjs").default;
    type TeqFw_Db_Back_Mod_Expression__Class = typeof import("./src/Back/Mod/Expression.mjs").default;
    type TeqFw_Db_Back_Mod_Selection = import("./src/Back/Mod/Selection.mjs").default;
    type TeqFw_Db_Back_Mod_Selection__Class = typeof import("./src/Back/Mod/Selection.mjs").default;
    type TeqFw_Db_Back_Plugin_Init = typeof import("./src/Back/Plugin/Init.mjs").default;
    type TeqFw_Db_Back_Plugin_Stop = typeof import("./src/Back/Plugin/Stop.mjs").default;
    type TeqFw_Db_Back_RDb_Connect = import("./src/Back/RDb/Connect.mjs").default;
    type TeqFw_Db_Back_RDb_Connect_Resolver = import("./src/Back/RDb/Connect/Resolver.mjs").default;
    type TeqFw_Db_Back_RDb_Connect_Resolver__Class = typeof import("./src/Back/RDb/Connect/Resolver.mjs").default;
    type TeqFw_Db_Back_RDb_Connect__Class = typeof import("./src/Back/RDb/Connect.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Knex = import("./src/Back/RDb/Dialect/Knex.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Knex_Executor = import("./src/Back/RDb/Dialect/Knex/Executor.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Knex_Executor__Class = typeof import("./src/Back/RDb/Dialect/Knex/Executor.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Knex__Class = typeof import("./src/Back/RDb/Dialect/Knex.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Mysql = import("./src/Back/RDb/Dialect/Mysql.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Mysql__Class = typeof import("./src/Back/RDb/Dialect/Mysql.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql = import("./src/Back/RDb/Dialect/Postgresql.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector = import("./src/Back/RDb/Dialect/Postgresql/PgVector.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector__Class = typeof import("./src/Back/RDb/Dialect/Postgresql/PgVector.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql__Class = typeof import("./src/Back/RDb/Dialect/Postgresql.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Registry = import("./src/Back/RDb/Dialect/Registry.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Registry__Class = typeof import("./src/Back/RDb/Dialect/Registry.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Sqlite = import("./src/Back/RDb/Dialect/Sqlite.mjs").default;
    type TeqFw_Db_Back_RDb_Dialect_Sqlite__Class = typeof import("./src/Back/RDb/Dialect/Sqlite.mjs").default;
    type TeqFw_Db_Back_RDb_History = import("./src/Back/RDb/History.mjs").default;
    type TeqFw_Db_Back_RDb_History__Class = typeof import("./src/Back/RDb/History.mjs").default;
    type TeqFw_Db_Back_RDb_IConnect = import("./src/Back/RDb/IConnect.mjs").default;
    type TeqFw_Db_Back_RDb_IConnect__Class = typeof import("./src/Back/RDb/IConnect.mjs").default;
    type TeqFw_Db_Back_RDb_ITrans = import("./src/Back/RDb/ITrans.mjs").default;
    type TeqFw_Db_Back_RDb_ITrans__Class = typeof import("./src/Back/RDb/ITrans.mjs").default;
    type TeqFw_Db_Back_RDb_Meta_IEntity = import("./src/Back/RDb/Meta/IEntity.mjs").default;
    type TeqFw_Db_Back_RDb_Meta_IEntity__Class = typeof import("./src/Back/RDb/Meta/IEntity.mjs").default;
    type TeqFw_Db_Back_RDb_Rebuild = import("./src/Back/RDb/Rebuild.mjs").default;
    type TeqFw_Db_Back_RDb_Rebuild_Execute = import("./src/Back/RDb/Rebuild/Execute.mjs").default;
    type TeqFw_Db_Back_RDb_Rebuild_Execute__Class = typeof import("./src/Back/RDb/Rebuild/Execute.mjs").default;
    type TeqFw_Db_Back_RDb_Rebuild__Class = typeof import("./src/Back/RDb/Rebuild.mjs").default;
    type TeqFw_Db_Back_RDb_Schema = import("./src/Back/RDb/Schema.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Builder = import("./src/Back/RDb/Schema/A/Builder.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Builder_Execute = import("./src/Back/RDb/Schema/A/Builder/Execute.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Builder_Execute__Class = typeof import("./src/Back/RDb/Schema/A/Builder/Execute.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Builder__Class = typeof import("./src/Back/RDb/Schema/A/Builder.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_DropOrder = import("./src/Back/RDb/Schema/A/DropOrder.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_DropOrder__Class = typeof import("./src/Back/RDb/Schema/A/DropOrder.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref = import("./src/Back/RDb/Schema/A/Dto/Ref.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref__Class = typeof import("./src/Back/RDb/Schema/A/Dto/Ref.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref__Factory = import("./src/Back/RDb/Schema/A/Dto/Ref.mjs").Factory;
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref__Factory__Class = typeof import("./src/Back/RDb/Schema/A/Dto/Ref.mjs").Factory;
    type TeqFw_Db_Back_RDb_Schema_A_Plan = import("./src/Back/RDb/Schema/A/Plan.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_A_Plan__Class = typeof import("./src/Back/RDb/Schema/A/Plan.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_EntityBase = import("./src/Back/RDb/Schema/EntityBase.mjs").default;
    type TeqFw_Db_Back_RDb_Schema_EntityBase__Class = typeof import("./src/Back/RDb/Schema/EntityBase.mjs").default;
    type TeqFw_Db_Back_RDb_Schema__Class = typeof import("./src/Back/RDb/Schema.mjs").default;
    type TeqFw_Db_Back_RDb_Trans = import("./src/Back/RDb/Trans.mjs").default;
    type TeqFw_Db_Back_RDb_Trans__Class = typeof import("./src/Back/RDb/Trans.mjs").default;
    type TeqFw_Db_Back_Util = import("./src/Back/Util.mjs").default;
    type TeqFw_Db_Back_Util_File = import("./src/Back/Util/File.mjs").default;
    type TeqFw_Db_Back_Util_File__Class = typeof import("./src/Back/Util/File.mjs").default;
    type TeqFw_Db_Back_Util_ListQuery = import("./src/Back/Util/ListQuery.mjs").default;
    type TeqFw_Db_Back_Util_ListQuery__Class = typeof import("./src/Back/Util/ListQuery.mjs").default;
    type TeqFw_Db_Back_Util__Class = typeof import("./src/Back/Util.mjs").default;
    type TeqFw_Db_Back_Util__dateUtc = typeof import("./src/Back/Util.mjs").dateUtc;
    type TeqFw_Db_Back_Util__formatAsDateTime = typeof import("./src/Back/Util.mjs").formatAsDateTime;
    type TeqFw_Db_Back_Util__getTables = typeof import("./src/Back/Util.mjs").getTables;
    type TeqFw_Db_Back_Util__isPostgres = typeof import("./src/Back/Util.mjs").isPostgres;
    type TeqFw_Db_Back_Util__itemsInsert = typeof import("./src/Back/Util.mjs").itemsInsert;
    type TeqFw_Db_Back_Util__itemsSelect = typeof import("./src/Back/Util.mjs").itemsSelect;
    type TeqFw_Db_Back_Util__nameFK = typeof import("./src/Back/Util.mjs").nameFK;
    type TeqFw_Db_Back_Util__nameNX = typeof import("./src/Back/Util.mjs").nameNX;
    type TeqFw_Db_Back_Util__nameUQ = typeof import("./src/Back/Util.mjs").nameUQ;
    type TeqFw_Db_Back_Util__pgSerialsGet = typeof import("./src/Back/Util.mjs").pgSerialsGet;
    type TeqFw_Db_Back_Util__serialsGet = typeof import("./src/Back/Util.mjs").serialsGet;
    type TeqFw_Db_Back_Util__serialsGetOne = typeof import("./src/Back/Util.mjs").serialsGetOne;
    type TeqFw_Db_Back_Util__serialsSet = typeof import("./src/Back/Util.mjs").serialsSet;
    type TeqFw_Db_BooleanNullable = boolean | null | undefined;
    type TeqFw_Db_ClientLike = {constructor: {name: string}};
    type TeqFw_Db_DateInput = Date | string | number | null | undefined;
    type TeqFw_Db_DemEntityInfo = {entity: DemEntity; pointer: string; tableName: string; path: string; uniqueKeys: string[][]};
    type TeqFw_Db_DemEntityMap = {[key: string]: TeqFw_Db_DemEntityInfo};
    type TeqFw_Db_DemEnvelope = {declaration: unknown; [key: string]: unknown};
    /** Intermediate DEM nodes preserve invalid tags until semantic validation. */
    type TeqFw_Db_DiagnosticArrayMutable = DemDiagnostic[];
    type TeqFw_Db_DecodedExpression = {kind: string; name?: string; value?: unknown; type?: DbLogicalType; operator?: string; args?: TeqFw_Db_DecodedExpression[]};
    type TeqFw_Db_DecodedAttribute = {name: string; comment: string; type: DbLogicalType; storage: Record<string, {type: string; params: Record<string, unknown>}>; nullable: boolean; default?: {kind: string; value?: unknown; name?: string; params?: Record<string, unknown>}; generation?: {kind: string; params: Record<string, unknown>}; __demSpecial?: string};
    type TeqFw_Db_DecodedIndexKey = {attr?: string; expression?: TeqFw_Db_DecodedExpression; order?: unknown; nulls?: unknown; operatorClass?: unknown};
    type TeqFw_Db_DecodedIndex = {name: string; kind: string; keys: TeqFw_Db_DecodedIndexKey[]; include: string[]; options: Record<string, unknown>; phase: string; method?: string; predicate?: TeqFw_Db_DecodedExpression};
    type TeqFw_Db_DecodedRelation = {name: string; attrs: string[]; ref: {path: string; attrs: string[]}; action: {delete?: string; update?: string}; deferrable: unknown};
    type TeqFw_Db_DecodedEntity = {name: string; path: string; comment: string; attr: Record<string, TeqFw_Db_DecodedAttribute>; index: Record<string, TeqFw_Db_DecodedIndex>; relation: Record<string, TeqFw_Db_DecodedRelation>};
    type TeqFw_Db_DecodedContainer = {entity: Record<string, TeqFw_Db_DecodedEntity>; package: Record<string, TeqFw_Db_DecodedContainer>; comment?: string; version?: number; requires?: string[]; refs?: Record<string, string[]>};
    type TeqFw_Db_ComposedModel = TeqFw_Db_DecodedContainer & {version: number; namespace: string; requires: string[]; deprecated: Record<string, string[]>};
    type TeqFw_Db_InputEnvelope = {declaration: unknown; filename?: string; fragmentId?: string; packageName?: string; revision?: string; mapId?: string};
    type TeqFw_Db_DecodedFragment = {declaration: TeqFw_Db_DecodedContainer | null; diagnostics: DemDiagnostic[]; envelope: TeqFw_Db_InputEnvelope; pointers: TeqFw_Db_StringMap};
    type TeqFw_Db_ComposedDem = {diagnostics: DemDiagnostic[]; externalRefs: Record<string, {refs: Record<string, string[]>; pointers: TeqFw_Db_StringMap; envelope: TeqFw_Db_InputEnvelope}>; invalid: Set<string>; model: TeqFw_Db_ComposedModel; ownerByPath: TeqFw_Db_StringMap; provenance: Record<string, DemSource[]>};
    type TeqFw_Db_ValidatingEntityInfo = {entity: TeqFw_Db_DecodedEntity; pointer: string; tableName: string; signatures: TeqFw_Db_StringMap; uniqueKeys: string[][]};
    type TeqFw_Db_LoadTestOptions = {testDems?: TeqFw_Db_StringMap; testMapRoot?: string};
    type TeqFw_Db_DecodedFragmentArray = ReadonlyArray<TeqFw_Db_DecodedFragment>;
    type TeqFw_Db_InputEnvelopeArray = ReadonlyArray<TeqFw_Db_InputEnvelope>;
    type TeqFw_Db_NameClaims = Record<string, {rawName: string; sourcePointer: string}>;
    type TeqFw_Db_DemFragment = {declaration: unknown; filename?: string; fragmentId?: string; packageName?: string};
    type TeqFw_Db_DemFragmentArray = TeqFw_Db_DemFragment[];
    type TeqFw_Db_DiagnosticArray = readonly DemDiagnostic[];
    type TeqFw_Db_Error = {name: string; message: string};
    type TeqFw_Db_ExportDto = {tables: {[key: string]: object[]}; serials: TeqFw_Db_StringMap};
    type TeqFw_Db_FileError = {code?: string; message: string};
    type TeqFw_Db_Identifier = string | string[];
    type TeqFw_Db_LogicalType = {id: string; params?: {[key: string]: unknown}};
    type TeqFw_Db_NumberOptional = number | undefined;
    type TeqFw_Db_Object = {[key: string]: unknown};
    type TeqFw_Db_ObjectArray = object[];
    type TeqFw_Db_ObjectArrayOrNull = object[] | null;
    type TeqFw_Db_ObjectOptional = object | undefined;
    type TeqFw_Db_ObjectOrNull = TeqFw_Db_Object | null;
    type TeqFw_Db_OrderDto = {alias: TeqFw_Db_StringOptional; dir: TeqFw_Db_StringOptional};
    type TeqFw_Db_QueryExpression = DbExpression;
    type TeqFw_Db_QueryExpressionArray = readonly DbExpression[];
    type TeqFw_Db_QueryOrdering = DbOrdering;
    type TeqFw_Db_QueryOrderingArray = readonly DbOrdering[];
    type TeqFw_Db_QueryProjection = {as: string; expression: TeqFw_Db_QueryExpression};
    type TeqFw_Db_QueryProjectionArray = readonly DbProjection[];
    type TeqFw_Db_SerialValue = number | string | null;
    type TeqFw_Db_Shared_Dto_Order = import("./src/Shared/Dto/Order.mjs").default;
    type TeqFw_Db_Shared_Dto_Order__Class = typeof import("./src/Shared/Dto/Order.mjs").default;
    type TeqFw_Db_Shared_Dto_Query_Expression = import("./src/Shared/Dto/Query/Expression.mjs").default;
    type TeqFw_Db_Shared_Dto_Query_Expression__Class = typeof import("./src/Shared/Dto/Query/Expression.mjs").default;
    type TeqFw_Db_Shared_Dto_Query_Expression__Factory = import("./src/Shared/Dto/Query/Expression.mjs").Factory;
    type TeqFw_Db_Shared_Dto_Query_Expression__Factory__Class = typeof import("./src/Shared/Dto/Query/Expression.mjs").Factory;
    type TeqFw_Db_Shared_Dto_Query_Selection = import("./src/Shared/Dto/Query/Selection.mjs").default;
    type TeqFw_Db_Shared_Dto_Query_Selection__Class = typeof import("./src/Shared/Dto/Query/Selection.mjs").default;
    type TeqFw_Db_Shared_Dto_Query_Selection__Factory = import("./src/Shared/Dto/Query/Selection.mjs").Factory;
    type TeqFw_Db_Shared_Dto_Query_Selection__Factory__Class = typeof import("./src/Shared/Dto/Query/Selection.mjs").Factory;
    type TeqFw_Db_Shared_Enum_Direction = typeof import("./src/Shared/Enum/Direction.mjs").default;
    type TeqFw_Db_Shared_Util_Cast = import("./src/Shared/Util/Cast.mjs").default;
    type TeqFw_Db_Shared_Util_Cast__Class = typeof import("./src/Shared/Util/Cast.mjs").default;
    type TeqFw_Db_Shared_Util_Deep = import("./src/Shared/Util/Deep.mjs").default;
    type TeqFw_Db_Shared_Util_Deep__Class = typeof import("./src/Shared/Util/Deep.mjs").default;
    type TeqFw_Db_StringArray = string[];
    type TeqFw_Db_StringArrayMap = {[key: string]: string[]};
    type TeqFw_Db_StringArrayOrNull = string[] | null;
    type TeqFw_Db_StringMap = {[key: string]: string};
    type TeqFw_Db_StringNumberMap = {[key: string]: number | string};
    type TeqFw_Db_StringOptional = string | undefined;
    type TeqFw_Db_ValidatedDem = {entities: TeqFw_Db_DemEntityMap; provenance: Record<string, DemSource[]>; model: DemModel; diagnostics: DemDiagnostic[]};
    type TeqFw_Log_Provider = {forSource: any};
}
export {};
