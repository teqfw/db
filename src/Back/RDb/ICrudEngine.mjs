/**
 * Interface for engine to perform simple CRUD queries.
 */
export default class TeqFw_Db_Back_RDb_ICrudEngine {
    async create(data, meta, trx) {};

    constructor(spec) {

        /**
         *
         * @param data
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta
         * @param trx
         * @return {Promise<number>}
         */
        this.create = async function (data, meta, trx) {
            /** @type {Builder} */
            const query = trx.queryBuilder();
            query.table('teq_user');
            query.insert(data);

            const sql = query.toString();
            const rs = await query;
            return 4;
        }
        this.deleteOne = async function () {}
        this.deleteSet = async function () {}
        this.readOne = async function () {}
        this.readSet = async function () {}
        this.updateOne = async function () {}
        this.updateSet = async function () {}
    }

}
