import assert from 'assert';
import {container, cfg} from '../../../../TestEnv.mjs';
import {describe, it} from 'node:test';
import {join} from 'path';
import {existsSync} from 'fs';

const pathData = join(cfg.path.test, 'data/mod/ds002');

// get an object from a container and run tests
/** @type {TeqFw_Db_Back_Dem_Load} */
const obj = await container.get('TeqFw_Db_Back_Dem_Load$');

describe('TeqFw_Db_Back_Dem_Load', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can load all DEMs and merge its', async () => {
        const {cfg, dem} = await obj.exec({path: pathData});
        assert(typeof cfg === 'object');
        assert(typeof dem === 'object');
    });
});

