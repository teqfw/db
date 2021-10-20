/**
 * Engine to perform simple CRUD operations.
 */
export default class TeqFw_Db_Back_RDb_CrudEngine {
    constructor(spec) {
        /** @type {TeqFw_Db_Back_Defaults} */
        const DEF = spec['TeqFw_Db_Back_Defaults$'];

        // DEFINE INNER FUNCTIONS
        /**
         * Compose table name for given entity and schema configuration.
         * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
         */
        function getTableName(cfg, meta) {
            const entity = meta.getEntityName();
            const prefix = cfg.prefix;
            const partsAll = entity.split(DEF.PS)
            const partsPath = (entity.charAt(0) === DEF.SCOPE_CHAR)
                ? partsAll.slice(2) // @vnd/plugin/...
                : partsAll.slice(1); // plugin/...
            const path = partsPath.join(DEF.NS)
            return ((typeof prefix === 'string') && (prefix.length > 0))
                ? `${prefix}${DEF.NS}${path}` : path;
        }

        // DEFINE INSTANCE METHODS
        /**
         *
         * @param {Object|Array}data
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @return {Promise<number>}
         */
        this.create = async function (data, meta, trx) {
            const cfg = trx.getSchemaConfig();
            const table = getTableName(cfg, meta);
            const attrs = meta.getAttributes();
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            const record = {};
            for (const attr of attrs)
                if (data[attr] !== undefined) record[attr] = data[attr];
            query.insert(record);
            if (trx.isPostgres()) {
                query.returning(meta.getPrimaryKey());
            }
            // const sql = query.toString();
            const rs = await query;
            return rs;
        }
        this.deleteOne = async function () {}
        this.deleteSet = async function () {}
        this.readOne = async function () {}
        this.readSet = async function () {}
        this.updateOne = async function () {}
        this.updateSet = async function () {}
    }
}
