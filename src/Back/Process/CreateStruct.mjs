// @ts-check

/**
 * @namespace TeqFw_Db_Back_Process_CreateStruct
 * @description TeqFW database package module.
 */

/**
 * Process to create DB structure from DEM descriptor.
 */
export default class TeqFw_Db_Back_Process_CreateStruct {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Logger} deps.logger
     * @param {TeqFw_Db_Back_Config} deps.config
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     * @param {TeqFw_Db_Back_Api_RDb_CrudEngine} deps.crud
     * @param {TeqFw_Db_Back_Api_RDb_Schema} deps.dbSchema
     * @param {TeqFw_Db_Back_Dem_Load} deps.demLoad
     */
    constructor({logger, config, conn, crud, dbSchema, demLoad}) {
        // INSTANCE METHODS

        /**
         * @param {object} deps
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} deps.meta
         * @returns {Promise<void>}
         */
        this.run = async function ({meta}) {
            // FUNCS
            /**
             * Don't (re-)create DB structure if the meta related table exists.
             * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
             * @returns {Promise<boolean>}
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
             * @returns {Promise<void>}
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

export const __deps__ = Object.freeze({
    default: Object.freeze({
            logger: 'TeqFw_Db_Back_Logger$',
            config: 'TeqFw_Db_Back_Config$',
            conn: 'TeqFw_Db_Back_RDb_Connect$',
            crud: 'TeqFw_Db_Back_RDb_CrudEngine$',
            dbSchema: 'TeqFw_Db_Back_RDb_Schema$',
            demLoad: 'TeqFw_Db_Back_Dem_Load$',
    }),
});
