/**
 * Process to create DB structure from DEM descriptor.
 */
export default class TeqFw_Db_Back_Process_CreateStruct {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
     * @param {TeqFw_Core_Back_Config} config
     * @param {TeqFw_Db_Back_RDb_IConnect} conn
     * @param {TeqFw_Db_Back_Api_RDb_CrudEngine} crud
     * @param {TeqFw_Db_Back_Api_RDb_Schema} dbSchema
     * @param {TeqFw_Db_Back_Dem_Load} demLoad
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Core_Back_Config$: config,
            TeqFw_Db_Back_RDb_IConnect$: conn,
            TeqFw_Db_Back_Api_RDb_CrudEngine$: crud,
            TeqFw_Db_Back_Api_RDb_Schema$: dbSchema,
            TeqFw_Db_Back_Dem_Load$: demLoad,
        }) {
        // INSTANCE METHODS

        /**
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
         * @return {Promise<void>}
         */
        this.run = async function ({meta}) {
            // FUNCS
            /**
             * Don't (re-)create DB structure if the meta related table exists.
             * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
             * @return {Promise<boolean>}
             */
            async function needDbStruct(meta) {
                let res = true;
                try {
                    const trx = await conn.startTransaction();
                    try {
                        const where = null, bind = null, order = null, limit = 1;
                        await crud.readSet(trx, meta, where, bind, order, limit);
                        await trx.commit();
                        res = false;
                    } catch (e) {
                        await trx.rollback();
                        logger.error(e);
                    }
                } catch (e) {
                    logger.error(e);
                }
                return res;
            }

            /**
             * Load DEM and re-create DB structure.
             * @return {Promise<void>}
             */
            async function createDbStruct() {
                // load DEMs then drop/create all tables
                const path = config.getPathToRoot();
                const {dem, cfg} = await demLoad.exec({path});
                await dbSchema.setDem({dem});
                await dbSchema.setCfg({cfg});
                await dbSchema.dropAllTables({conn});
                await dbSchema.createAllTables({conn});
                logger.info('Database structure is recreated.');
            }

            // MAIN
            if (await needDbStruct(meta)) await createDbStruct();
        };

    }
}
