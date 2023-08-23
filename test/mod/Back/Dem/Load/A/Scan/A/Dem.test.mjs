import assert from 'assert';
import {container, cfg} from '../../../../../../../TestEnv.mjs';
import {describe, it} from 'mocha';
import {join} from 'path';
import {existsSync} from 'fs';

/** @type {TeqFw_Di_Container} */
// const container = await testEnv();
/** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} */
const obj = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$');
const pathData = join(cfg.path.test, 'data/mod/ds001');
const pathMap = join(pathData, 'dem.user.json');

describe('TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem', function () {
    it('there is DEM JSON file', async () => {
        assert(existsSync(pathMap));
    });

    it('can load JSON', async () => {
        const dem = await obj.exec({filename: pathMap});
        assert(dem?.entity?.user?.name === 'user');
    });
});
