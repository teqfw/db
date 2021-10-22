/**
 * 'knex' based engine to perform simple CRUD operations.
 * @implements TeqFw_Db_Back_Api_RDb_ICrudEngine
 */
export default class TeqFw_Db_Back_RDb_CrudEngine {
    constructor() {

        // DEFINE INSTANCE METHODS

        this.create = async function (data, meta, trx) {
            const res = {};
            const table = trx.getTableName(meta);
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
            if (trx.isMariaDB()) {
                const pk = meta.getPrimaryKey();
                if (pk.length === 1) { // simple PK
                    res[pk[0]] = rs[0];
                } else { // complex PK
                    for (const key of pk)
                        res[key] = data[key];
                }
            }
            return res;
        }
        this.deleteOne = async function (data, meta, trx) {}
        this.deleteSet = async function (data, meta, trx) {}
        this.readOne = async function (key, meta, trx) {
            let res = null;
            const table = trx.getTableName(meta);
            const attrs = meta.getAttributes();
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            const where = {};
            for (const attr of attrs)
                if (key[attr] !== undefined) where[attr] = key[attr];
            query.where(where);
            // const sql = query.toString();
            const rs = await query;
            if (rs.length === 1) {
                const [first] = rs;
                res = meta.createDto(first);
            }
            return res;
        }
        this.readSet = async function (data, meta, trx) {}
        this.updateOne = async function (data, meta, trx) {}
        this.updateSet = async function (data, meta, trx) {}
    }
}
