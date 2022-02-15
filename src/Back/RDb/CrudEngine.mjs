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
            const attrs = meta.getAttrNames();
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            const record = {};
            if (data)
                for (const attr of attrs)
                    if (data[attr] !== undefined) record[attr] = data[attr];
            query.insert(record);
            if (trx.isPostgres()) {
                query.returning(meta.getPrimaryKey());
            }
            // const sql = query.toString();
            const rs = await query;
            if (trx.isMariaDB() || trx.isSqlite()) {
                const pk = meta.getPrimaryKey();
                if (pk.length === 1) { // simple PK
                    res[pk[0]] = rs[0];
                } else { // complex PK
                    if (data)
                        for (const key of pk) res[key] = data[key];
                }
            } else if (trx.isPostgres()) {
                if (Array.isArray(rs) && (typeof rs[0] === 'object')) Object.assign(res, rs[0]);
            }
            return res;
        }
        this.deleteOne = async function (trx, meta, key) {
            const table = trx.getTableName(meta);
            const attrs = meta.getAttrNames();
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            // check key values according to allowed attributes and set record filter
            const where = {};
            const keyParts = Array.isArray(key) ? Object.fromEntries(key) : key;
            for (const one of Object.keys(keyParts))
                if (attrs.includes(one)) where[one] = key[one];
            if (Object.keys(where) <= 0) throw new Error('You want to delete one entity but key is missed. Execution is interrupted.');
            query.where(where);
            return await query.del();
        }

        this.deleteSet = async function (trx, meta, where) {
            const table = trx.getTableName(meta);
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            query.where(where);
            return await query.del();
        }

        this.readOne = async function (trx, meta, key) {
            // ENCLOSED FUNCS
            /**
             * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
             * @param {*} key
             */
            function composeWhere(meta, key) {
                const res = {};
                if (
                    (typeof key === 'number') ||
                    (typeof key === 'string') ||
                    (typeof key === 'boolean')
                ) {
                    // simple key
                    const [pk] = meta.getPrimaryKey();
                    res[pk] = key;
                } else {
                    // complex key
                    const attrs = meta.getAttrNames();
                    const keyParts = Array.isArray(key) ? Object.fromEntries(key) : key;
                    for (const one of Object.keys(keyParts))
                        if (attrs.includes(one)) res[one] = key[one];
                }
                return res;
            }

            // MAIN
            let res = null;
            const table = trx.getTableName(meta);
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            // check key values according to allowed attributes and set record filter
            const where = composeWhere(meta, key);
            query.where(where);
            query.limit(2); // should be one only item, limit if search key is not unique
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
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            if (where) query.where(where);
            if (order) query.orderBy(order);
            if (offset) query.offset(offset);
            if (limit) query.limit(limit);
            // const sql = query.toString();
            const rs = await query;
            if (rs.length > 0)
                for (const one of rs) {
                    const item = meta.createDto(one);
                    res.push(item);
                }
            return res;
        }

        this.updateOne = async function (trx, meta, data) {
            const table = trx.getTableName(meta);
            const pkey = meta.getPrimaryKey();
            const attrs = meta.getAttrNames();
            /** @type {Knex.QueryBuilder} */
            const query = trx.createQuery();
            query.table(table);
            // collect data part and primary key part
            const updates = {}, where = {};
            const parts = Array.isArray(data) ? Object.fromEntries(data) : data;
            for (const one of Object.keys(parts))
                if (pkey.includes(one)) where[one] = parts[one]; // add to primary key
                else if (attrs.includes(one)) updates[one] = parts[one]; // add to updating values
            query.update(updates);
            query.where(where);
            return query; // return await query?
        }
        this.updateSet = async function (trx, meta, data) {}
    }
}
