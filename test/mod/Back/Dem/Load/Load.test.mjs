import assert from 'assert';
import {container, cfg} from '../../../../TestEnv.mjs';
import {describe, it} from 'node:test';
import {join} from 'path';
import {existsSync} from 'fs';

const pathData = join(cfg.path.test, 'data/mod/ds002');

// get an object from a container and run tests
/** @type {TeqFw_Db_Back_Dem_Load} */
const obj = await container.get('TeqFw_Db_Back_Dem_Load$');
/** @type {TeqFw_Db_Back_Api_RDb_Dialect} */
const adapter = await container.get('TeqFw_Db_Back_RDb_Dialect_Sqlite$');
/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');

describe('TeqFw_Db_Back_Dem_Load', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can load all DEMs and merge its', async () => {
        const {cfg, dem, compilation} = await obj.exec({path: pathData, adapter});
        assert(typeof cfg === 'object');
        assert(typeof dem === 'object');
        assert.equal(compile.assertResult({value: compilation}), compilation);
        assert(Object.isFrozen(compilation));
        assert(Object.isFrozen(dem));
        assert(Object.isFrozen(cfg));
    });
});

