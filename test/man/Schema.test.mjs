/**
 * Drop/create DB schema for manual tests.
 */
import assert from 'assert';
import {container, cfg as cfgTest, dbConnect} from '../TestEnv.mjs';
import {describe, it} from 'mocha';
import {join} from 'path';
import {existsSync} from 'fs';


// get runtime objects from DI
/** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} */
const loadDem = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$');
/** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} */
const loadMap = await container.get('TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$');
/** @type {TeqFw_Db_Back_Dem_Load_A_Norm} */
const norm = await container.get('TeqFw_Db_Back_Dem_Load_A_Norm$');
/** @type {TeqFw_Db_Back_Dem_Load_A_SchemaCfg} */
const schemaCfg = await container.get('TeqFw_Db_Back_Dem_Load_A_SchemaCfg$');
/** @type {TeqFw_Db_Back_RDb_Schema} */
const schema = await container.get('TeqFw_Db_Back_RDb_Schema$');

// prepare this unit runtime objects
const pathData = join(cfgTest.path.test, 'data/man/base');
const pathDem = join(pathData, 'dem.json');
const pathMap = join(pathData, 'map.json');
const demApp = await loadDem.exec({filename: pathDem});
const map = await loadMap.exec({filename: pathMap});
const dems = {app: demApp};
const {dem} = await norm.exec({dems, map});
const {cfg} = await schemaCfg.exec({map});

describe('Manual tests Schema', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can drop all tables', async () => {
        /** @type {TeqFw_Db_Back_RDb_IConnect} */
        const conn = await dbConnect();
        schema.setDem({dem});
        schema.setCfg({cfg});
        await schema.dropAllTables({conn});
        await conn.disconnect();
    });

    it('can create all tables', async () => {
        /** @type {TeqFw_Db_Back_RDb_IConnect} */
        const conn = await dbConnect();
        schema.setDem({dem});
        schema.setCfg({cfg});
        await schema.createAllTables({conn});
        await conn.disconnect();
    });

});

