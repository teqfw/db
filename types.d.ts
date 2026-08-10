import type {Knex} from 'knex';

export type DbScalar = string | number | boolean | bigint | Date | Buffer | null;
export type DbRow = Readonly<Record<string, unknown>>;
export type DbMutableRow = Record<string, unknown>;
export type DbKey = DbScalar | ReadonlyArray<DbScalar> | Readonly<Record<string, DbScalar>>;
export interface DbDtoFactory<T = Readonly<Record<string, unknown>>> { create(data?: unknown): T; }

export interface DbConfig extends Readonly<Knex.Config> {}
export type DbNamedConfigs = Readonly<Record<string, DbConfig>>;

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
    getKnex(): Knex;
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

export interface DbCrudCreateInput { readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly dto: DbRow; }
export interface DbCrudReadInput { readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly key: DbKey; readonly select?: readonly string[]; }
export interface DbCrudListInput { readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly selection?: DbSelectionV2; readonly conditions?: DbRow; readonly sorting?: Readonly<Record<string, DbDirection>>; readonly pagination?: DbPagination; }
export interface DbCrudUpdateInput { readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly key: DbKey; readonly updates: DbRow; }
export interface DbCrudDeleteInput { readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly key: DbKey; }
export interface DbCrudListResult<T extends DbRow = DbRow> { readonly items: readonly T[]; readonly count?: number; }
export interface DbCrud {
    createOne(input: DbCrudCreateInput): Promise<{readonly primaryKey: Readonly<Record<string, DbScalar>>}>;
    readOne(input: DbCrudReadInput): Promise<{readonly record: DbRow | null}>;
    readMany(input: DbCrudListInput): Promise<{readonly records: readonly DbRow[]; readonly count?: number}>;
    updateOne(input: DbCrudUpdateInput): Promise<{readonly updatedCount: number}>;
    updateMany(input: {readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly conditions: DbRow; readonly updates: DbRow}): Promise<{readonly updatedCount: number}>;
    deleteOne(input: DbCrudDeleteInput): Promise<{readonly deletedCount: number}>;
    deleteMany(input: {readonly schema: DbEntitySchema; readonly trx?: DbTransaction; readonly conditions: DbRow}): Promise<{readonly deletedCount: number}>;
}
export interface DbTransactionWrapper { execute<T>(outer: DbTransaction | undefined, operation: (trx: DbTransaction) => Promise<T>, onCommit?: (value: T) => void, onRollback?: (error: Error) => void): Promise<T>; }

export type DbDirection = 'asc' | 'desc';
export interface DbLogicalType { readonly id: string; readonly params?: Readonly<Record<string, unknown>>; }
export interface DbAttributeExpression { readonly kind: 'attr'; readonly name: string; }
export interface DbValueExpression { readonly kind: 'value'; readonly value: unknown; readonly type?: DbLogicalType; }
export interface DbCallExpression { readonly kind: 'call'; readonly operator: string; readonly args: readonly DbExpression[]; }
export type DbExpression = DbAttributeExpression | DbValueExpression | DbCallExpression;
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
export interface DbCountResult { readonly count: number; }

export interface DemSource { readonly fragmentId: string; readonly filename: string; readonly sourcePointer: string; readonly packageName?: string; }
export interface DemFragmentEnvelope { readonly fragmentId: string; readonly filename: string; readonly packageName: string; readonly declaration: unknown; }
export interface DemMapEnvelope { readonly filename?: string; readonly declaration: unknown; }
export type DemDiagnosticSeverity = 'error' | 'warning';
export type DemDiagnosticStage = 'parse' | 'decode' | 'composition' | 'logical' | 'graph' | 'dialect' | 'preflight' | 'plan' | 'query';
export interface DemDiagnostic { readonly code: string; readonly details: Readonly<Record<string, unknown>>; readonly message: string; readonly path: string; readonly severity: DemDiagnosticSeverity; readonly sources: readonly DemSource[]; readonly stage: DemDiagnosticStage; }
export interface DemGraph { readonly entities: readonly string[]; readonly topological: readonly string[]; readonly cycles: readonly (readonly string[])[]; readonly relations?: readonly unknown[]; }
export interface DemPhysicalPlan { readonly adapter: string; readonly namespace?: string; readonly tables: readonly DemPhysicalTable[]; readonly relations: readonly unknown[]; readonly phases: Readonly<Record<string, Readonly<{requirements: readonly string[]} & Record<string, unknown>>>>; }
export interface DemPhysicalTable { readonly entity: string; readonly name: string; readonly comment?: string; readonly columns: readonly DemPhysicalColumn[]; }
export interface DemPhysicalColumn { readonly name: string; readonly logicalType: DbLogicalType; readonly physicalType: unknown; readonly nullable: boolean; readonly defaultValue?: unknown; readonly generation?: unknown; readonly requirements: readonly string[]; }
export type DemProvenance = Readonly<Record<string, readonly DemSource[]>>;
export interface DemCompilationResult { readonly fingerprint: string; readonly graph: DemGraph; readonly model: Readonly<Record<string, unknown>>; readonly physical: DemPhysicalPlan; readonly provenance: DemProvenance; readonly requirements: readonly string[]; readonly warnings: readonly DemDiagnostic[]; }
export interface DemCompiler { exec(input: {readonly fragments: readonly DemFragmentEnvelope[]; readonly mapEnvelope: DemMapEnvelope; readonly adapter: DbDialectAdapter}): Promise<DemCompilationResult>; assertResult(input: {readonly value: unknown}): DemCompilationResult; }

export interface DbDialectDescription { readonly id: string; readonly family?: string; readonly capabilities?: readonly string[]; readonly [key: string]: unknown; }
export interface DbCapabilityPreflight { readonly operation: string; readonly requirements: readonly string[]; readonly fingerprint: string; readonly connection: DbConnection | DbTransaction; }
export interface DbValueCodec { encode(value: unknown): unknown; decode(value: unknown): unknown; }
export interface DbTypedOperator { readonly id: string; readonly arity: number | readonly number[]; readonly contexts: readonly string[]; readonly result: DbLogicalType; }
export type DbExecutionOptions = Readonly<Record<string, string | number | boolean>>;
export type DbSchemaPhase = 'preflight' | 'dropRelations' | 'dropTables' | 'tables' | 'constraints' | 'relations' | 'data' | 'afterRelations' | 'afterData';
export interface DbSchemaOperation { readonly identity: string; readonly phase: DbSchemaPhase; readonly entity?: string; readonly required?: boolean; readonly payload?: unknown; }
export interface DbSchemaPlan { readonly fingerprint: string; readonly operation: 'create' | 'drop' | 'rebuild' | 'transfer'; readonly phases: Readonly<Record<DbSchemaPhase, readonly DbSchemaOperation[] | Readonly<Record<string, unknown>>>>; }
export interface DbSchemaExecutionEvidence { readonly status: 'complete' | 'failed'; readonly phases: readonly DbLateIndexOutcome[]; readonly failure?: DbOperationFailure; }
export interface DbPreflightResult { readonly diagnostics: readonly DemDiagnostic[]; readonly [key: string]: unknown; }
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
    restoreGeneratedState(input: Readonly<Record<string, unknown>>): Promise<unknown>;
    encodeValue(input: Readonly<Record<string, unknown>>): unknown;
    decodeValue(input: Readonly<Record<string, unknown>>): unknown;
}

export type DbRebuildMode = 'inPlace' | 'parallel';
export type DbCycleStrategy = Readonly<Record<string, unknown>>;
export interface DbSnapshotReader { readTable(input: {readonly entity: string; readonly table: string}): Promise<readonly DbRow[]> | readonly DbRow[]; }
export interface DbTransformation { readonly id: string; exec(input: {readonly entity: string; readonly row: DbRow}): Promise<DbRow> | DbRow; }
export interface DbRebuildInput { readonly mode: DbRebuildMode; readonly compilation: DemCompilationResult; readonly sourceCompilation?: DemCompilationResult; readonly source: DbConnection; readonly target: DbConnection; readonly sourceId: string; readonly targetId: string; readonly snapshot?: DbSnapshotReader; readonly authorizeDiscard?: boolean; readonly transformations?: Readonly<Record<string, DbTransformation>>; readonly sourceTransaction?: DbTransaction; readonly targetTransaction?: DbTransaction; readonly cycleStrategy?: DbCycleStrategy; }
export type DbOperationStatus = 'running' | 'complete' | 'failed';
export type DbTransactionOutcome = 'notStarted' | 'started' | 'committed' | 'rolledBack' | 'rollbackFailed' | 'externalUnchanged';
export interface DbOperationFailure { readonly entity?: string | null; readonly message: string; readonly name: string; readonly stage: string; }
export interface DbTableEvidence { readonly entity: string; readonly table: string; readonly status: string; readonly sourceRows?: number; readonly targetRows?: number; readonly transformation?: string; readonly error?: Readonly<{name: string; message: string}>; }
export interface DbLateIndexOutcome { readonly identity: string; readonly phase: string; readonly status: string; }
export interface DbRebuildEvidence {
    readonly accepted: boolean;
    readonly dataComplete: boolean;
    readonly failures: readonly DbOperationFailure[];
    readonly fingerprint: string;
    readonly generatedState: readonly unknown[];
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

declare global {
    type TeqFw_Db_InternalComponent = Readonly<Record<string, unknown>>;
    type TeqFw_Db_ComponentClass = abstract new (...args: never[]) => TeqFw_Db_InternalComponent;
    type TeqFw_Db_Enum = Readonly<Record<string, string>>;
    type Knex = import('knex').Knex;
    namespace Knex { type QueryBuilder = import('knex').Knex.QueryBuilder; type Transaction = import('knex').Knex.Transaction; type Config = import('knex').Knex.Config; }
    type SchemaBuilder = import('knex').Knex.SchemaBuilder;
    type array = unknown[];
    type TeqFw_Db_Back_Act_Dem_RdbTables = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Act_Dem_RdbTables__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Act_Dem_Tables = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Act_Dem_Tables__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_Import_Transform = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_Import_Transform__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_RDb_CrudEngine = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_RDb_CrudEngine__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_RDb_Query_List = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_RDb_Query_List__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_RDb_QueryBuilder = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_RDb_QueryBuilder__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_RDb_Repository = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_RDb_Repository__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_RDb_Schema = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_RDb_Schema__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Api_RDb_Schema_Object = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Api_RDb_Schema_Object__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_App_Crud = DbCrud;
    type TeqFw_Db_Back_App_Crud__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_App_Shutdown = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_App_Shutdown__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_App_TrxWrapper = DbTransactionWrapper;
    type TeqFw_Db_Back_App_TrxWrapper__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Cli_Drop = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Cli_Drop__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Cli_Dto_Command = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Cli_Dto_Command__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Cli_Dto_Command { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Cli_Dto_Command__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Cli_Dto_Command_Option = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Cli_Dto_Command_Option__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Cli_Dto_Command_Option { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Cli_Dto_Command_Option__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Cli_Export = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Cli_Export__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Cli_Export_A_Select = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Cli_Export_A_Select__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Cli_Import = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Cli_Import__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Cli_Init = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Cli_Init__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Defaults = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Defaults__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_Compose = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_Compose__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_DecodeV1 = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_DecodeV1__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_DecodeV2 = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_DecodeV2__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_Fingerprint = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_Fingerprint__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_Graph = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_Graph__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_LegacyFacade = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_LegacyFacade__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_MapRefs = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_MapRefs__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_Validate = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_Validate__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Compile_A_ValidateNames = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Compile_A_ValidateNames__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Load = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Load__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Load_A_Scan = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Load_A_Scan__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Map = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Load_A_Scan_A_Map__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Load_A_SchemaCfg = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Load_A_SchemaCfg__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Registry_Core = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Registry_Core__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dem_Registry_CoreValue = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Dem_Registry_CoreValue__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Dto_Config_Local = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Config_Local__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Config_Local { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Config_Local__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Config_Local_Connection = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Config_Local_Connection__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Config_Local_Connection { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Config_Local_Connection__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Config_Schema = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Config_Schema__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Config_Schema { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Config_Schema__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Compile_Graph { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Compile_Graph__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Compile_Source = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Compile_Source__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Compile_Source { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Compile_Source__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity_Attr { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Index = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity_Index__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity_Index { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity_Index__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity_Relation { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Dem_Package = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Dem_Package__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Dem_Package { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Dem_Package__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Export = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Export__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Export { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Export__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Map = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Map__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Map { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Map__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_Map_Ref = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_Map_Ref__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_Map_Ref { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_Map_Ref__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_RDb_Column = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_RDb_Column__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_RDb_Column { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_RDb_Column__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_RDb_Index = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_RDb_Index__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_RDb_Index { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_RDb_Index__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_RDb_Relation = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_RDb_Relation__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_RDb_Relation { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_RDb_Relation__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Dto_RDb_Table = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_Dto_RDb_Table__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_Dto_RDb_Table { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_Dto_RDb_Table__Factory = DbDtoFactory;
    type TeqFw_Db_Back_Enum_Db_Type_Action = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Enum_Db_Type_Action__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Db_Type_Column = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Enum_Db_Type_Column__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Db_Type_Index = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Enum_Db_Type_Index__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Dem_Type_Action = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Enum_Dem_Type_Action__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Dem_Type_Attr = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Enum_Dem_Type_Attr__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Dem_Type_Index = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Enum_Dem_Type_Index__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Logger = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Logger__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Mod_Expression = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Mod_Expression__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Mod_Selection = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Mod_Selection__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Plugin_Init = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Plugin_Init__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Plugin_Stop = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Plugin_Stop__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Process_CreateStruct = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Process_CreateStruct__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Connect = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Connect__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Connect_Resolver = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Connect_Resolver__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_CrudEngine = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_CrudEngine__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Knex = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Knex__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Knex_Executor = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Knex_Executor__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Mysql = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Mysql__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Postgresql_PgVector__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Registry = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Registry__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Dialect_Sqlite = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Dialect_Sqlite__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Rebuild_Execute = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Rebuild_Execute__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Schema = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Schema_A = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema_A_Builder = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema_A_Builder__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Schema_A_Builder_Execute = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema_A_Builder_Execute__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Schema_A_DropOrder = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema_A_DropOrder__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Back_RDb_Schema_A_Dto_Ref { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Back_RDb_Schema_A_Dto_Ref__Factory = DbDtoFactory;
    type TeqFw_Db_Back_RDb_Schema_A_Plan = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema_A_Plan__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Schema_EntityBase = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Schema_EntityBase__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Trans = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_RDb_Trans__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Util = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Util__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Util_File = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Util_File__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Util_ListQuery = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Back_Util_ListQuery__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Dto_List_Event_Request = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Event_Request__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Event_Request { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Event_Request__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_List_Event_Response = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Event_Response__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Event_Response { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Event_Response__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_List_Selection = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Selection__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Selection { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Selection__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Func = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Func__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Func { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Func__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Value = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Value__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Value { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_List_Selection_Filter_Value__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Dto_Order = Readonly<Record<string, unknown>>;
    type TeqFw_Db_Shared_Dto_Order__Class = TeqFw_Db_ComponentClass;
    namespace TeqFw_Db_Shared_Dto_Order { type Factory = DbDtoFactory; type Dto = Readonly<Record<string, unknown>>; }
    type TeqFw_Db_Shared_Dto_Order__Factory = DbDtoFactory;
    type TeqFw_Db_Shared_Enum_Filter_Cond = TeqFw_Db_Enum;
    type TeqFw_Db_Shared_Enum_Filter_Cond__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Enum_Filter_Func = TeqFw_Db_Enum;
    type TeqFw_Db_Shared_Enum_Filter_Func__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Util_Cast = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Shared_Util_Cast__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Util_Deep = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Shared_Util_Deep__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Util_List = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Shared_Util_List__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Util_Select = TeqFw_Db_InternalComponent;
    type TeqFw_Db_Shared_Util_Select__Class = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Config = {get(name?: string | null): DbConfig; getPathToRoot(): string; getAppVersion(): string | null; init(root: string, appVersion?: string): void};
    type TeqFw_Db_Back_RDb_IConnect = DbConnection;
    type TeqFw_Db_Back_RDb_ITrans = DbTransaction;
    type TeqFw_Db_Back_RDb_Meta_IEntity = DbEntitySchema;
    type TeqFw_Db_Back_Api_RDb_Dialect = DbDialectAdapter;
    type TeqFw_Db_Back_Dem_Compile = DemCompiler;
    type TeqFw_Db_Back_Dto_Dem_Compile_Result = DemCompilationResult;
    namespace TeqFw_Db_Back_Dto_Dem_Compile_Result { type Factory = DbDtoFactory<DemCompilationResult>; }
    type TeqFw_Db_Back_Dto_Dem_Compile_Result__Factory = DbDtoFactory<DemCompilationResult>;
    type TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic = DemDiagnostic;
    namespace TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic { type Factory = DbDtoFactory<DemDiagnostic>; }
    type TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic__Factory = DbDtoFactory<DemDiagnostic>;
    type TeqFw_Db_Back_RDb_Rebuild = DbRebuild;
    type TeqFw_Db_Back_Api_RDb_Rebuild = DbRebuild;
    type TeqFw_Db_Shared_Dto_Query_Expression = DbExpression;
    namespace TeqFw_Db_Shared_Dto_Query_Expression { type Factory = DbDtoFactory<DbExpression>; }
    type TeqFw_Db_Shared_Dto_Query_Expression__Factory = DbDtoFactory<DbExpression>;
    type TeqFw_Db_Shared_Dto_Query_Selection = DbSelectionV2;
    namespace TeqFw_Db_Shared_Dto_Query_Selection { type Factory = DbDtoFactory<DbSelectionV2>; }
    type TeqFw_Db_Shared_Dto_Query_Selection__Factory = DbDtoFactory<DbSelectionV2>;
    type TeqFw_Db_Shared_Enum_Direction = TeqFw_Db_Enum;
    type TeqFw_Db_Back_Dto_Dem_Entity__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Db_Type_Action__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Db_Type_Column__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Db_Type_Index__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_Enum_Dem_Type_Action__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Back_RDb_Trans__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Enum_Direction__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Enum_Filter_Cond__default = TeqFw_Db_ComponentClass;
    type TeqFw_Db_Shared_Enum_Filter_Func__default = TeqFw_Db_ComponentClass;
}

export {};
