import assert from 'assert';
import {container, cfg} from '../../../../../TestEnv.mjs';
import {describe, it} from 'node:test';
import {join} from 'path';
import {existsSync} from 'fs';

const pathData = join(cfg.path.test, 'data/mod/ds002');

// get an object from a container and run tests
/** @type {TeqFw_Db_Back_Dem_Load_A_Scan} */
const obj = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan$');

describe('TeqFw_Db_Back_Dem_Load_A_Scan', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can scan app folders', async () => {
        const res = await obj.exec({path: pathData});
        assert(typeof res?.dems === 'object');
        assert(res?.map?.namespace === 'teq');
    });
});

