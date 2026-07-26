import assert from 'assert';
import {container, cfg} from '../../../../../TestEnv.mjs';
import {describe, it} from 'mocha';
import {join} from 'path';
import {existsSync} from 'fs';

const pathData = join(cfg.path.test, 'data/mod/ds002');

// get an object from a container and run tests
/** @type {TeqFw_Db_Back_Dem_Load_A_Scan} */
const scan = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan$');
/** @type {TeqFw_Db_Back_Dem_Load_A_Norm} */
const obj = await container.get('TeqFw_Db_Back_Dem_Load_A_Norm$');

describe('TeqFw_Db_Back_Dem_Load_A_Norm', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can normalize DEMs using MAP', async () => {
        const {dems, map} = await scan.exec({path: pathData});
        const {dem} = await obj.exec({dems, map});
        assert(typeof dem?.entity?.plugin === 'object');
        assert.strictEqual(dem?.package?.app?.entity?.profile?.relation?.user?.ref?.path, '/plugin');
    });
});

