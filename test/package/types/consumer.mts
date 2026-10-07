import type {
    DbConfig,
    DbConnection,
    DbDialectAdapter,
    DbRebuildEvidence,
    DbSelectionV2,
    DbTransaction,
    DemCompilationResult,
    DemDiagnostic,
} from '@teqfw/db';

declare const config: DbConfig;
declare const connection: DbConnection;
declare const transaction: DbTransaction;
declare const adapter: DbDialectAdapter;
declare const compilation: DemCompilationResult;
declare const schema: TeqFw_Db_Back_RDb_Schema;
declare const schemaContract: TeqFw_Db_Back_Api_RDb_Schema;
schema.setCompilation({compilation});
const installedCompilation: DemCompilationResult = schema.getCompilation();
const contractCompilation: DemCompilationResult = schemaContract.getCompilation();
void [installedCompilation, contractCompilation];
declare const diagnostic: DemDiagnostic;
declare const selection: DbSelectionV2;
declare const evidence: DbRebuildEvidence;

const ambientConnection: TeqFw_Db_Back_RDb_IConnect = connection;
const ambientTransaction: TeqFw_Db_Back_RDb_ITrans = transaction;
const ambientCompilerResult: TeqFw_Db_Back_Dto_Dem_Compile_Result = compilation;
declare const selectionFactory: TeqFw_Db_Shared_Dto_Query_Selection__Factory;
const ambientSelection: TeqFw_Db_Shared_Dto_Query_Selection = selectionFactory.create(selection);

void [config, adapter, diagnostic, evidence];
void [ambientConnection, ambientTransaction, ambientCompilerResult, ambientSelection];
