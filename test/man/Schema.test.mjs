/**
 * Drop/create DB schema for manual tests through the branded compiler result.
 */
import assert from 'assert';
import {container, cfg as cfgTest, dbConnect} from '../TestEnv.mjs';
import {describe, it} from 'node:test';
import {join} from 'path';
import {existsSync} from 'fs';

/** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} */
const loadDem = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$');
/** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} */
const loadMap = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$');
/** @type {TeqFw_Db_Back_Dem_Compile} */
const compile = await container.get('TeqFw_Db_Back_Dem_Compile$');
/** @type {TeqFw_Db_Back_RDb_Schema} */
const schema = await container.get('TeqFw_Db_Back_RDb_Schema$');

const pathData = join(cfgTest.path.test, 'data/man/base');
const pathDem = join(pathData, 'dem.json');
const pathMap = join(pathData, 'map.json');
const declaration = await loadDem.exec({filename: pathDem});
const map = await loadMap.exec({filename: pathMap});

describe('Manual tests Schema', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can drop and create all compiled tables', async () => {
        /** @type {TeqFw_Db_Back_RDb_IConnect} */
        const conn = await dbConnect();
        const compilation = await compile.exec({
            adapter: conn.getDialectAdapter(),
            fragments: [{declaration, filename: pathDem, fragmentId: 'app', packageName: 'app'}],
            mapEnvelope: {declaration: map, filename: pathMap, mapId: 'app:map', packageName: 'app'},
        });
        schema.setCompilation({compilation});
        await schema.dropAllTables({conn});
        await schema.createAllTables({conn});
        await conn.disconnect();
    });
});
