import assert from 'assert';
import {container, cfg} from '../../../../../../../TestEnv.mjs';
import {describe, it} from 'mocha';
import {join} from 'path';
import {existsSync} from 'fs';

/** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} */
const obj = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$');
const pathData = join(cfg.path.test, 'data/mod/ds001');
const pathMap = join(pathData, 'map.json');

describe('TeqFw_Db_Back_Dem_Load_A_Scan_A_Map', function () {
    it('there is MAP JSON file', async () => {
        assert(existsSync(pathMap));
    });

    it('can load JSON', async () => {
        const map = await obj.exec({filename: pathMap});
        assert(map.namespace === 'teq');
    });
});
