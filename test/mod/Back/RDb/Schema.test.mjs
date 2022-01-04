import assert from 'assert';
import {container, cfg, dbConnect} from '../../../TestEnv.mjs';
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
container.set('TeqFw_Core_Back_App_Scan_Plugin_Registry$', regPlugins);

// get object from container and run tests
/** @type {TeqFw_Db_Back_Dem_Load} */
const load = await container.get('TeqFw_Db_Back_Dem_Load$');
/** @type {TeqFw_Db_Back_RDb_Schema} */
const obj = await container.get('TeqFw_Db_Back_RDb_Schema$');

describe('TeqFw_Db_Back_RDb_Schema', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can drop/create tables', async () => {
        /** @type {TeqFw_Db_Back_RDb_IConnect} */
        const conn = await dbConnect();
        const {dem, cfg} = await load.exec({path: pathData});
        obj.setDem({dem});
        obj.setCfg({cfg});
        await obj.dropAllTables({conn});
        await obj.createAllTables({conn});
        await conn.disconnect();
    });

});

