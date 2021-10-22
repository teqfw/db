/**
 * 'knex' based engine to perform simple CRUD operations.
 * @implements TeqFw_Db_Back_Api_RDb_ICrudEngine
 */
export default class TeqFw_Db_Back_RDb_CrudEngine {
    constructor() {

        // DEFINE INSTANCE METHODS

        this.create = async function (trx, meta, data) {
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
        this.deleteOne = async function (trx, meta, data) {}
        this.deleteSet = async function (trx, meta, data) {}
        this.readOne = async function (trx, meta, key) {
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

        this.readSet = async function (trx, meta, where, bind, order, limit, offset) {
            let res = [];
            const table = trx.getTableName(meta);
            const attrs = meta.getAttributes();
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            query.where(where);
            // const sql = query.toString();
            const rs = await query;
            if (rs.length > 0)
                for (const one of rs) {
                    const item = meta.createDto(one);
                    res.push(item);
                }
            return res;
        }

        this.updateOne = async function (trx, meta, data) {}
        this.updateSet = async function (trx, meta, data) {}
    }
}
