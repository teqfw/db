import {readdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {lint} from 'markdownlint/promise';

const root = fileURLToPath(new URL('../../', import.meta.url));
const files = [];

async function collect(directory, recursive) {
    const entries = await readdir(join(root, directory), {withFileTypes: true});
    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const path = join(directory, entry.name);
        if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(path);
        } else if (recursive && entry.isDirectory()) {
            await collect(path, true);
        }
    }
}

await collect('.', false);
await collect('skills', true);
files.sort();

const config = JSON.parse(await readFile(join(root, '.markdownlint.json'), 'utf8'));
const results = await lint({files: files.map((file) => join(root, file)), config});
let issueCount = 0;
for (const file of files) {
    for (const issue of results[join(root, file)]) {
        const column = issue.errorRange?.[0] ?? 1;
        const detail = issue.errorDetail ? ` [${issue.errorDetail}]` : '';
        console.error(`${file}:${issue.lineNumber}:${column} ${issue.ruleNames.join('/')} ${issue.ruleDescription}${detail}`);
        issueCount++;
    }
}
if (issueCount) {
    process.exitCode = 1;
} else {
    console.log(`Checked ${files.length} Markdown files: no issues.`);
}
