import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {describe, it} from 'node:test';
import {container} from '../TestEnv.mjs';

const scan = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan$');
const packageRoot = new URL('../../', import.meta.url).pathname;

describe('DEM fragment scanner', () => {
    it('discovers the package-owned schema declaration as an ordinary node_modules fragment', async () => {
        const root = mkdtempSync(join(tmpdir(), 'teqfw-db-dem-scan-'));
        try {
            mkdirSync(join(root, 'etc'));
            mkdirSync(join(root, 'node_modules/@teqfw'), {recursive: true});
            symlinkSync(packageRoot, join(root, 'node_modules/@teqfw/db'), 'dir');
            writeFileSync(join(root, 'package.json'), JSON.stringify({name: 'fixture-app'}));
            writeFileSync(join(root, 'etc/teqfw.schema.json'), JSON.stringify({
                version: 2, requires: [], refs: {}, package: {}, entity: {},
            }));
            writeFileSync(join(root, 'etc/teqfw.schema.map.json'), JSON.stringify({version: 2, namespace: 'fixture'}));

            const result = await scan.exec({path: root});
            const platform = result.fragments.find((item) => item.packageName === '@teqfw/db');
            assert(platform);
            assert.equal(platform.fragmentId, '@teqfw/db');
            assert.equal(platform.filename, join(root, 'node_modules/@teqfw/db/etc/teqfw.schema.json'));
            assert.equal(platform.declaration.namespace, 'teqfw.db.schema');
            assert.equal(platform.declaration.entity.snapshot !== undefined, true);
            assert.equal(platform.declaration.entity.application !== undefined, true);
        } finally {
            rmSync(root, {recursive: true, force: true});
        }
    });
});
