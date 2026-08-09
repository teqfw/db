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
        assert(res?.map?.namespace === 'teq');
        assert(Array.isArray(res.fragments));
        assert(Object.isFrozen(res.fragments));
        assert(res.fragments.every((item) => Object.isFrozen(item) && Object.isFrozen(item.declaration)));
        assert.equal(res.mapEnvelope.mapId, 'app:map');
        assert(Object.isFrozen(res.mapEnvelope));
        assert(Object.isFrozen(res.mapEnvelope.declaration));
    });
});

