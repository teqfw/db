import type {
    DbIdentity,
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
declare const diagnostic: DemDiagnostic;
declare const selection: DbSelectionV2;
declare const evidence: DbRebuildEvidence;

const ambientConnection: TeqFw_Db_Back_RDb_IConnect = connection;
const ambientTransaction: TeqFw_Db_Back_RDb_ITrans = transaction;
const ambientCompilerResult: TeqFw_Db_Back_Dto_Dem_Compile_Result = compilation;
const ambientSelection: TeqFw_Db_Shared_Dto_Query_Selection = selection;

void [config, adapter, diagnostic, evidence];
void [ambientConnection, ambientTransaction, ambientCompilerResult, ambientSelection];

declare const identity: DbIdentity;
const allocation: Promise<number> = identity.allocate({compilation, transaction, entity: '/sample/people/person'});
const sync = identity.synchronize({compilation, transaction});
void [allocation, sync];
