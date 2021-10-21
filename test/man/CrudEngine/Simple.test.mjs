/**
 * Manual tests to develop CRUD functionality for entities with simple primary keys.
 */
import assert from 'assert';
import {container, cfg as cfgTest, dbConnect} from '../../TestEnv.mjs';
import {describe, it} from 'mocha';
import {join} from 'path';
import {existsSync} from 'fs';
import {load} from '../lib/basic.mjs';
import {Meta as MSimple} from '../lib/meta/simple.mjs';

// get runtime objects from DI
/** @type {TeqFw_Db_Back_RDb_CrudEngine} */
const crud = await container.get('TeqFw_Db_Back_RDb_CrudEngine$');

// prepare this unit runtime objects
const pathData = join(cfgTest.path.test, 'data/man/base');
const {cfg} = await load(container, pathData);
const meta = new MSimple({plugin: 'test'});

describe('CRUD Engine - simple PK', function () {
    it('there is app root folder', async () => {
        assert(existsSync(pathData));
    });

    it('can create entity', async () => {
        /** @type {TeqFw_Db_Back_RDb_Connect} */
        const conn = await dbConnect();
        conn.setSchemaConfig(cfg);
        const trx = await conn.startTransaction();
        try {
            const data = {'not_exist': 4};
            const pk = await crud.create(data, meta, trx);
            assert(typeof pk[MSimple.ATTR.ID] === 'number');
            await trx.commit();
        } catch (e) {
            await trx.rollback();
        }
        await conn.disconnect();
    });


});

