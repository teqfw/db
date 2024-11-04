/**
 * Relational DB utilities.
 *
 * @namespace TeqFw_Db_Back_Util
 */
// MODULE'S FUNCTIONS

/**
 * Format UTC date-time as ISO 8601 string.
 * @param {Date|string|null} [dateIn]
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 */
function dateUtc(dateIn) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn)
        : new Date();
    const y = date.getUTCFullYear();
    const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const d = `${date.getUTCDate()}`.padStart(2, '0');
    const h = `${date.getUTCHours()}`.padStart(2, '0');
    const i = `${date.getUTCMinutes()}`.padStart(2, '0');
    const s = `${date.getUTCSeconds()}`.padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${i}:${s}Z`;
}

/**
 * Format input data to be used as MySQL datetime compatible string (UTC).
 *
 * @param {Date|string|null} [dateIn]
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 * @deprecated use TeqFw_Db_Back_Util.dateUtc
 */
function formatAsDateTime(dateIn) {
    /** @type {Date} */
    const date = (dateIn) ?
        (dateIn instanceof Date) ? dateIn : new Date(dateIn)
        : new Date();
    const y = date.getUTCFullYear();
    const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const d = `${date.getUTCDate()}`.padStart(2, '0');
    const h = `${date.getUTCHours()}`.padStart(2, '0');
    const i = `${date.getUTCMinutes()}`.padStart(2, '0');
    const s = `${date.getUTCSeconds()}`.padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${i}:${s}`;
}

/**
 * Get list of available tables.
 * @param {TeqFw_Db_Back_RDb_ITrans} trx
 * @returns {Promise<*[]>}
 * @memberOf TeqFw_Db_Back_Util
 */
async function getTables(trx) {
    const result = [];
    const knex = trx.getKnexTrx();
    const dialect = knex.client.config.client;
    if (['mysql', 'mysql2'].includes(dialect)) {
        const rs = await knex.raw('show tables');
        if (Array.isArray(rs)) {
            const column = rs[1][0]['name'];
            rs[0].map(one => result.push(one[column]));
        }
    } else if (['pg'].includes(dialect)) {
        const rs = await knex.raw('SELECT * FROM information_schema.tables  WHERE table_schema = \'public\'');
        if (Array.isArray(rs?.rows)) {
            rs.rows.map(one => result.push(one['table_name']));
        }
    } else {
        throw new Error(`This dialect (${dialect}) is not supported.`);
    }
    return result;
}

/**
 * Return 'true' if knex client is connected to Postgres DB.
 * @param client
 * @returns {boolean}
 * @memberOf TeqFw_Db_Back_Util
 */
function isPostgres(client) {
    return client.constructor.name === 'Client_PG';
}

/** @deprecated */
async function itemsInsert(trx, table, rows) {
    return me.itemsInsert(trx, table, rows);
}

/** @deprecated */
async function itemsSelect(trx, tables, entity, cols = null) {
    return me.itemsSelect(trx, tables, entity, cols);
}

/**
 * Create name for foreign key constraint.
 *
 * @param {String} tblSrc
 * @param {String|String[]} fldSrc
 * @param {String} tblTrg
 * @param {String|String[]} fldTrg
 * @returns {String}
 * @memberOf TeqFw_Db_Back_Util
 */
function nameFK(tblSrc, fldSrc, tblTrg, fldTrg) {
    let result = `FK_${tblSrc}_`;
    // type of fldSrc should correspond to type of fldTrg
    if (typeof fldSrc === 'string') {
        result += `_${fldSrc}__${tblTrg}__${fldTrg}`;  // tblSrc__col__tblTrg__col
    } else if (Array.isArray(fldSrc)) { // tblSrc__col1_col2__tblTrg__col1_col2
        for (const one of fldSrc) result += `_${one}`;
        result += `__${tblTrg}_`;
        for (const one of fldTrg) result += `_${one}`;
    }
    return result;
}

/**
 * Create name for index key constraint.
 *
 * @param {String} tbl
 * @param {String|String[]} fld
 * @returns {String}
 * @memberOf TeqFw_Db_Back_Util
 */
function nameNX(tbl, fld) {
    let result = `IK_${tbl}_`;
    if (typeof fld === 'string') {
        result += `_${fld.toLowerCase()}`;
    } else if (Array.isArray(fld)) {
        for (const one of fld) result += `_${one.toLowerCase()}`;
    }
    return result;
}

/**
 * Create name for unique key constraint.
 *
 * @param {String} tbl
 * @param {String|String[]} fld
 * @returns {String}
 * @memberOf TeqFw_Db_Back_Util
 */
function nameUQ(tbl, fld) {
    let result = `UK_${tbl}_`;
    if (typeof fld === 'string') {
        result += `_${fld.toLowerCase()}`;
    } else if (Array.isArray(fld)) {
        for (const one of fld) result += `_${one.toLowerCase()}`;
    }
    return result;
}

/** @deprecated */
async function pgSerialsGet(trx) {
    return me.pgSerialsGet(trx);
}

/**
 * Get 'nextval' for Postgres serials.
 * @param schema
 * @param {String[]} serials
 * @returns {Promise<Object>}
 * @memberOf TeqFw_Db_Back_Util
 */
async function serialsGet(schema, serials) {
    const result = {};
    for (const one of serials) {
        schema.raw(`SELECT nextval('${one}')`);
    }
    const rs = await schema;
    for (const i in rs.rows) {
        const key = serials[i];
        result[key] = rs.rows[0].nextval;
    }
    return result;
}

/**
 * Get 'nextval' for one Postgres serial.
 * @param schema
 * @param {string} serial
 * @returns {Promise<string|null>}
 * @memberOf TeqFw_Db_Back_Util
 */
async function serialsGetOne(schema, serial) {
    try {
        schema.raw(`SELECT nextval('${serial}')`);
        const rs = await schema;
        const [first] = rs.rows;
        return first.nextval;
    } catch (e) {
        return null;
    }
}

/** @deprecated */
async function serialsSet(schema, serials) {
    return me.pgSerialsSet(schema, serials);
}


// MODULE'S CLASSES
export default class TeqFw_Db_Back_Util {
    /**
     * Insert table items selected by 'itemsSelect'.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {string} table raw name (with prefix, if exists)
     * @param {array} rows
     * @returns {Promise<void>}
     */
    async itemsInsert(trx, table, rows) {
        const knex = trx.getKnexTrx();
        if (Array.isArray(rows) && rows.length > 0) {
            await knex(table).insert(rows);
        }
    }

    /**
     * Select * from 'entity' if 'entity' exists in 'tables' or null otherwise.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {string[]} tables list of raw names (with prefix, if exists)
     * @param {string} entity
     * @param {string[]|null} cols
     * @returns {Promise<*|null>}
     * @memberOf TeqFw_Db_Back_Util
     */
    async itemsSelect(trx, tables, entity, cols = null) {
        const knex = trx.getKnexTrx();
        if (tables.includes(entity)) {
            if (Array.isArray(cols)) {
                return await knex.select(cols).from(entity);
            } else {
                return await knex.select().from(entity);
            }
        } else {
            return null;
        }
    }

    /**
     * Get 'nextval' for Postgres serials.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @returns {Promise<Object<string, string>>}
     * @memberOf TeqFw_Db_Back_Util
     */
    async pgSerialsGet(trx) {
        const res = {};
        const all = await trx.raw('SELECT sequence_name FROM information_schema.sequences  WHERE sequence_schema = \'public\'');
        if (Array.isArray(all?.rows)) {
            // prepare batch of SQLs
            for (const one of all.rows) {
                const name = one['sequence_name'];
                const rs = await trx.raw(`SELECT nextval('${name}')`);
                res[name] = rs.rows[0]['nextval'];
            }
        }
        return res;
    }

    /**
     * Set nextval for Postgres serial.
     * @param schema
     * @param {Object} serials
     * @returns {Promise<void>}
     * @memberOf TeqFw_Db_Back_Util
     */
    async pgSerialsSet(schema, serials) {
        for (const one of Object.keys(serials)) {
            if (serials[one] !== null)
                schema.raw(`SELECT setval('${one}', ${serials[one]})`);
        }
        await schema;
    }

}

// MAIN
const me = new TeqFw_Db_Back_Util();
export {
    dateUtc,
    formatAsDateTime,
    getTables,
    isPostgres,
    itemsInsert,
    itemsSelect,
    nameFK,
    nameNX,
    nameUQ,
    pgSerialsGet,
    serialsGet,
    serialsGetOne,
    serialsSet,
};
