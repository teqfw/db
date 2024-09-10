/**
 * The model to populate queries with clauses from selection object.
 * (@see TeqFw_Db_Shared_Dto_List_Selection)
 */
import assert from 'assert';
import {config as cfgTest, container} from '@teqfw/test';
import {describe, it} from 'mocha';

// SETUP ENV

/** @type {TeqFw_Core_Back_Config} */
const config = await container.get('TeqFw_Core_Back_Config$');
config.init(cfgTest.pathToRoot, 'test');
const cfgDb = config.getLocal('@teqfw/db');

/**
 * Framework wide RDB connection from DI. This connection is used by event listeners.
 * @type {TeqFw_Db_Back_RDb_Connect}
 */
const connFw = await container.get('TeqFw_Db_Back_RDb_IConnect$');
/** @type {TeqFw_Core_Back_Mod_App_Uuid} */
const modBackUuid = await container.get('TeqFw_Core_Back_Mod_App_Uuid$');
await modBackUuid.init();


// GET OBJECT FROM CONTAINER AND RUN TESTS
/** @type {TeqFw_Db_Back_Mod_Selection} */
const mod = await container.get('TeqFw_Db_Back_Mod_Selection$');
/** @type {TeqFw_Db_Shared_Dto_List_Selection} */
const selection = await container.get('TeqFw_Db_Shared_Dto_List_Selection$');
/** @type {Lp_Cust_Back_Web_Api_Event_List_A_Query} */
const meta = await container.get('Lp_Cust_Back_Web_Api_Event_List_A_Query$');


describe('TeqFw_Db_Back_Mod_Selection', function () {

    it('can be instantiated', async () => {
        assert(typeof mod === 'object');
    });

    it('parses a filter', async () => {
        await connFw.init(cfgDb);
        const trx = await connFw.startTransaction();
        try {
            const query = meta.build(trx, {bid: 2, lang: 'es'});
            const dto = selection.createDto({
                'filter': {
                    'items': [
                        {'name': 'GTE', 'params': [{'alias': 'dateStart'}, {'value': '2024-05-09T08:32:02.462Z'}]},
                        {'name': 'LTE', 'params': [{'alias': 'dateStart'}, {'value': '2024-05-09T08:32:02.462Z'}]}
                    ], 'with': 'AND'
                },
                'orderBy': [{'alias': 'dateStart', 'dir': 'desc'}]
            });
            mod.populate(trx, meta, query, dto);
            const sql = query.toString();
            assert(sql);
        } finally {
            await trx.rollback();
            await connFw.disconnect();
        }

    });

});

