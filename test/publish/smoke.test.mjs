import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {dirname, join, normalize, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

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
});
