import assert from 'node:assert/strict';
import {existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {dirname, join, normalize, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';
import {mkdtempSync} from 'node:fs';
import * as ts from 'typescript';
import Container from '@teqfw/di';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('npm publication', () => {
    it('contains the complete package-owned consumer skill', () => {
        const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        for (const path of ['etc/', 'skills/', 'src/', 'LICENSE', 'CHANGELOG.md', 'README.md']) {
            assert(manifest.files.includes(path), `Missing publication allowlist entry: ${path}`);
        }

        const required = [
            'etc/teqfw.schema.json',
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

    it('keeps the publication allowlist free of stale paths', () => {
        const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        for (const path of manifest.files) {
            assert(existsSync(join(root, path)), `Stale publication allowlist entry: ${path}`);
        }
    });

    it('keeps the documented source map aligned with the repository', () => {
        const overview = readFileSync(join(root, 'ctx/docs/code/overview.md'), 'utf8');
        assert.match(overview, /`src\/Back\/Act\/`, `App\/`, `Cli\/`, and `Plugin\//);
        assert.doesNotMatch(overview, /`(?:src\/Back\/)?Process\/`/);
    });

    it('publishes the type-only root contract and required artifact files', () => {
        const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
        assert.equal(manifest.types, 'types.d.ts');
        assert.deepEqual(manifest.exports, {'.': {types: './types.d.ts'}});
        assert(existsSync(join(root, manifest.types)));
        assert(existsSync(join(root, manifest.exports['.'].types)));

    });

    it('verifies declarations and runtime DI against a real packed artifact', async () => {
        const temp = mkdtempSync(join(tmpdir(), 'teqfw-db-types-'));
        try {
            const packed = JSON.parse(execFileSync('npm', [
                'pack', '--ignore-scripts', '--json', '--pack-destination', temp, '--cache', join(temp, 'cache'),
            ], {cwd: root, encoding: 'utf8'}))[0];
            const entries = packed.files.map((file) => file.path);
            assert(entries.includes('SECURITY.md'));
            assert(entries.includes('etc/teqfw.schema.json'));
            assert(entries.includes('skills/teqfw-db/SKILL.md'));
            assert(entries.includes('src/Back/Dto/Dem.mjs'));
            assert(entries.includes('.env.example'));
            for (const entry of entries) {
                assert(!/^(?:ctx|test|bin|node_modules|\.git|\.agents|\.github)\//.test(entry), `Development asset in tarball: ${entry}`);
                assert(!/(?:^|\/)\.env(?:\.|$)/.test(entry) || entry === '.env.example', `Working configuration in tarball: ${entry}`);
                assert(!/(?:^|\/)(?:package-lock\.json|npm-shrinkwrap\.json)$/.test(entry), `Application lockfile in tarball: ${entry}`);
            }
            const packageDir = join(temp, 'node_modules/@teqfw/db');
            mkdirSync(join(temp, 'node_modules/@teqfw'), {recursive: true});
            mkdirSync(packageDir);
            execFileSync('tar', ['-xzf', join(temp, packed.filename), '-C', packageDir, '--strip-components=1']);
            const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
            for (const name of [...Object.keys(manifest.dependencies), ...Object.keys(manifest.peerDependencies)]) {
                symlinkSync(join(root, 'node_modules', name), join(temp, 'node_modules', name), 'dir');
            }
            const sourceFiles = packed.files.filter((file) => file.path.startsWith('src/') && file.path.endsWith('.mjs'));
            for (const file of sourceFiles) execFileSync(process.execPath, ['--check', join(packageDir, file.path)]);
            const forbiddenHooks = ['preinstall', 'install', 'postinstall', 'prepare'];
            for (const hook of forbiddenHooks) assert(!manifest.scripts[hook], `Installation lifecycle hook: ${hook}`);

            writeFileSync(join(temp, 'consumer.mts'), `
import type {
    DbConfig, DbConnection, DbIdentity, DbRebuildEvidence,
    DbSelectionV2, DbTransaction, DemCompilationResult, DemDiagnostic
} from '@teqfw/db';
declare const cfg: DbConfig;
declare const conn: DbConnection;
declare const trx: DbTransaction;
declare const compilation: DemCompilationResult;
declare const diagnostic: DemDiagnostic;
declare const selection: DbSelectionV2;
declare const evidence: DbRebuildEvidence;
declare const identity: DbIdentity;
const allocation: Promise<number> = identity.allocate({compilation, transaction: trx, entity: '/sample/people/person'});
const synchronization = identity.synchronize({compilation, transaction: trx});
void [allocation, synchronization];
const ambientConn: TeqFw_Db_Back_RDb_IConnect = conn;
const ambientTrx: TeqFw_Db_Back_RDb_ITrans = trx;
const ambientCompilation: TeqFw_Db_Back_Dto_Dem_Compile_Result = compilation;
void [cfg, diagnostic, selection, evidence, ambientConn, ambientTrx, ambientCompilation];
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
            const container = new Container({namespaces: installedManifest.teqfw.fw.di.namespaces.map((item) => ({
                prefix: item.prefix, target: join(packageDir, item.path), defaultExt: item.ext,
            }))});
            const factory = await container.get('TeqFw_Db_Back_Dto_Dem__Factory$');
            const dto = factory.create({entity: {example: {attr: {id: {type: 'id'}}}}});
            assert.deepEqual(Object.keys(dto.entity), ['example']);
            assert.equal(dto.entity.example.attr.id.type, 'id');
        } finally {
            rmSync(temp, {recursive: true, force: true});
        }
    });
});
