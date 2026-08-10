import assert from 'node:assert/strict';
import {cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, normalize, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';
import {mkdtempSync} from 'node:fs';
import * as ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('npm publication', () => {
    it('contains the complete package-owned consumer skill', () => {
        const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        for (const path of ['skills/', 'src/', 'LICENSE', 'README.md', 'RELEASE.md']) {
            assert(manifest.files.includes(path), `Missing publication allowlist entry: ${path}`);
        }

        const required = [
            'skills/teqfw-db/SKILL.md',
            'skills/teqfw-db/agents/openai.yaml',
            'skills/teqfw-db/references/concepts.md',
            'skills/teqfw-db/references/distribution.md',
            'skills/teqfw-db/references/package-api.md',
            'skills/teqfw-db/references/usage.md',
        ];

        for (const path of required) assert(existsSync(join(root, path)), `Missing skill file: ${path}`);

        const skillRoot = join(root, 'skills/teqfw-db');
        const entry = readFileSync(join(skillRoot, 'SKILL.md'), 'utf8');
        const links = [...entry.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
        for (const link of links) {
            const target = normalize(join(skillRoot, link));
            assert.equal(relative(skillRoot, target).startsWith('..'), false, `External skill link: ${link}`);
            assert(existsSync(target), `Broken skill link: ${link}`);
        }
    });

    it('publishes the type-only root contract and required artifact files', () => {
        const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        assert.equal(manifest.types, 'types.d.ts');
        assert.deepEqual(manifest.exports, {'.': {types: './types.d.ts'}});
        assert(existsSync(join(root, manifest.types)));
        assert(existsSync(join(root, manifest.exports['.'].types)));

    });

    it('type-checks a consumer against the installed package layout', () => {
        const temp = mkdtempSync(join(tmpdir(), 'teqfw-db-types-'));
        try {
            const packageDir = join(temp, 'node_modules/@teqfw/db');
            mkdirSync(join(temp, 'node_modules/@teqfw'), {recursive: true});
            mkdirSync(packageDir);
            for (const path of ['package.json', 'types.d.ts', 'jsconfig.json']) {
                cpSync(join(root, path), join(packageDir, path));
            }
            symlinkSync(join(root, 'node_modules/knex'), join(temp, 'node_modules/knex'), 'dir');

            writeFileSync(join(temp, 'consumer.mts'), `
import type {
    DbConfig, DbConnection, DbCrudCreateInput, DbRebuildEvidence,
    DbSelectionV2, DbTransaction, DemCompilationResult, DemDiagnostic
} from '@teqfw/db';
declare const cfg: DbConfig;
declare const conn: DbConnection;
declare const trx: DbTransaction;
declare const create: DbCrudCreateInput;
declare const compilation: DemCompilationResult;
declare const diagnostic: DemDiagnostic;
declare const selection: DbSelectionV2;
declare const evidence: DbRebuildEvidence;
const ambientConn: TeqFw_Db_Back_RDb_IConnect = conn;
const ambientTrx: TeqFw_Db_Back_RDb_ITrans = trx;
const ambientCompilation: TeqFw_Db_Back_Dto_Dem_Compile_Result = compilation;
void [cfg, create, diagnostic, selection, evidence, ambientConn, ambientTrx, ambientCompilation];
`);
            writeFileSync(join(temp, 'tsconfig.json'), JSON.stringify({
                compilerOptions: {
                    module: 'nodenext',
                    moduleResolution: 'nodenext',
                    noEmit: true,
                    skipLibCheck: true,
                    strict: true,
                    target: 'ESNext',
                    typeRoots: [join(root, 'node_modules/@types')],
                },
                include: ['consumer.mts'],
            }));
            const configFile = ts.readConfigFile(join(temp, 'tsconfig.json'), ts.sys.readFile);
            const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, temp);
            const program = ts.createProgram(parsed.fileNames, parsed.options);
            const diagnostics = ts.getPreEmitDiagnostics(program);
            assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
                getCanonicalFileName: (name) => name,
                getCurrentDirectory: () => temp,
                getNewLine: () => '\n',
            }));

            const requireFromConsumer = createRequire(join(temp, 'consumer.mjs'));
            assert.throws(() => requireFromConsumer.resolve('@teqfw/db'), /No "exports" main defined/);
            assert.throws(() => requireFromConsumer.resolve('@teqfw/db/src/Back/Config.mjs'), /Package subpath/);

            const installedManifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
            assert.deepEqual(installedManifest.teqfw.fw.di.namespaces, [{
                prefix: 'TeqFw_Db_', path: './src', ext: '.mjs',
            }]);
        } finally {
            rmSync(temp, {recursive: true, force: true});
        }
    });
});
