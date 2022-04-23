import assert from 'assert';
import {container, cfg} from '../../../../../TestEnv.mjs';
import {describe, it} from 'mocha';
import {join} from 'path';
import {existsSync} from 'fs';

const pathData = join(cfg.path.test, 'data/mod/ds002');
const pathDataPlugin = join(pathData, 'node_modules/plugin');
const pathDataVndPlugin = join(pathData, 'node_modules/@vnd/plugin');

// mock dependencies
const regPlugins = {
    getMapPath2Name() {
        return {
            [pathData]: 'app',
            [pathDataPlugin]: 'plugin',
            [pathDataVndPlugin]: '@vnd/plugin'
        }
    }
};
container.set('TeqFw_Core_Back_Mod_Init_Plugin_Registry$', regPlugins);

// get object from container and run tests
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

