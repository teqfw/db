// @ts-check

/**
 * @namespace TeqFw_Db_Back_Util
 * @description TeqFW database package module.
 */

/**
 * Relational DB utilities.
 *
 * @namespace TeqFw_Db_Back_Util
 */

// MODULE'S FUNCTIONS

/**
 * Format UTC date-time as ISO 8601 string.
 * @param {TeqFw_Db_DateInput} dateIn
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 */
export function dateUtc(dateIn) {
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
 * @param {TeqFw_Db_DateInput} dateIn
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 * @deprecated use TeqFw_Db_Back_Util.dateUtc
 */
export function formatAsDateTime(dateIn) {
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
 * @returns {Promise<TeqFw_Db_StringArray>}
 * @memberOf TeqFw_Db_Back_Util
 */
export function getTables(trx) {
    return (async () => {
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
    })();
}

/**
 * Return 'true' if knex client is connected to Postgres DB.
 * @param {TeqFw_Db_ClientLike} client
 * @returns {boolean}
 * @memberOf TeqFw_Db_Back_Util
 */
export function isPostgres(client) {
    return client.constructor.name === 'Client_PG';
}

/**
 * @param {TeqFw_Db_Back_RDb_ITrans} trx
 * @param {string} table
 * @param {TeqFw_Db_ObjectArray} rows
 * @returns {Promise<void>}
 * @deprecated
 */
export function itemsInsert(trx, table, rows) {
    return (async () => me.itemsInsert(trx, table, rows))();
}

/**
 * @param {TeqFw_Db_Back_RDb_ITrans} trx
 * @param {TeqFw_Db_StringArray} tables
 * @param {string} entity
 * @param {TeqFw_Db_StringArrayOrNull} cols
 * @returns {Promise<TeqFw_Db_ObjectArrayOrNull>}
 * @deprecated
 */
export function itemsSelect(trx, tables, entity, cols = null) {
    return (async () => me.itemsSelect(trx, tables, entity, cols))();
}

/**
 * Create name for foreign key constraint.
 * @param {string} tblSrc
 * @param {TeqFw_Db_Identifier} fldSrc
 * @param {string} tblTrg
 * @param {TeqFw_Db_Identifier} fldTrg
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 */
export function nameFK(tblSrc, fldSrc, tblTrg, fldTrg) {
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
 * @param {string} tbl
 * @param {TeqFw_Db_Identifier} fld
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 */
export function nameNX(tbl, fld) {
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
 * @param {string} tbl
 * @param {TeqFw_Db_Identifier} fld
 * @returns {string}
 * @memberOf TeqFw_Db_Back_Util
 */
export function nameUQ(tbl, fld) {
    let result = `UK_${tbl}_`;
    if (typeof fld === 'string') {
        result += `_${fld.toLowerCase()}`;
    } else if (Array.isArray(fld)) {
        for (const one of fld) result += `_${one.toLowerCase()}`;
    }
    return result;
}

/**
 * @param {TeqFw_Db_Back_RDb_ITrans} trx
 * @returns {Promise<TeqFw_Db_StringNumberMap>}
 * @deprecated
 */
export function pgSerialsGet(trx) {
    return (async () => me.pgSerialsGet(trx))();
}

/**
 * Get 'nextval' for Postgres serials.
 * @param {object} schema
 * @param {TeqFw_Db_StringArray} serials
 * @returns {Promise<TeqFw_Db_StringNumberMap>}
 * @memberOf TeqFw_Db_Back_Util
 */
export function serialsGet(schema, serials) {
    return (async () => {
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
    })();
}

/**
 * Get 'nextval' for one Postgres serial.
 * @param {object} schema
 * @param {string} serial
 * @returns {Promise<TeqFw_Db_SerialValue>}
 * @memberOf TeqFw_Db_Back_Util
 */
export function serialsGetOne(schema, serial) {
    return (async () => {
        try {
            schema.raw(`SELECT nextval('${serial}')`);
            const rs = await schema;
            const [first] = rs.rows;
            return first.nextval;
        } catch (e) {
            return null;
        }
    })();
}

/**
 * @param {object} schema
 * @param {TeqFw_Db_StringNumberMap} serials
 * @returns {Promise<any>}
 * @deprecated
 */
export function serialsSet(schema, serials) {
    return (async () => me.pgSerialsSet(schema, serials))();
}

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Util {
    /**
     * Initialize the component.
     */
    constructor() {
        /**
         * Insert table items selected by 'itemsSelect'.
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {string} table
         * @param {TeqFw_Db_ObjectArray} rows
         * @returns {Promise<void>}
         */
        this.itemsInsert = async function(trx, table, rows) {
            const knex = trx.getKnexTrx();
            if (Array.isArray(rows) && rows.length > 0) {
                await knex(table).insert(rows);
            }
        };

        /**
         * Select * from 'entity' if 'entity' exists in 'tables' or null otherwise.
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {TeqFw_Db_StringArray} tables
         * @param {string} entity
         * @param {TeqFw_Db_StringArrayOrNull} cols
         * @returns {Promise<TeqFw_Db_ObjectArrayOrNull>}
         * @memberOf TeqFw_Db_Back_Util
         */
        this.itemsSelect = async function(trx, tables, entity, cols = null) {
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
        };

        /**
         * Get 'nextval' for Postgres serials.
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @returns {Promise<any>}
         * @memberOf TeqFw_Db_Back_Util
         */
        this.pgSerialsGet = async function(trx) {
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
        };

        /**
         * Set nextval for Postgres serial.
         * @param {any} schema
         * @param {TeqFw_Db_StringNumberMap} serials
         * @returns {Promise<void>}
         * @memberOf TeqFw_Db_Back_Util
         */
        this.pgSerialsSet = async function(schema, serials) {
            for (const one of Object.keys(serials)) {
                if (serials[one] !== null)
                    schema.raw(`SELECT setval('${one}', ${serials[one]})`);
            }
            await schema;
        };

        /**
         * Convert the query columns into the tables' fields to group by.
         * @param {TeqFw_Db_StringMap} columns
         * @param {TeqFw_Db_StringMap} map
         * @returns {TeqFw_Db_StringArray}
         * @deprecated
         * @see TeqFw_Db_Back_Util_ListQuery
         */
        this.prepareGroupBy = function(columns, map) {
            const res = [];
            for (const key of Object.values(columns))
                if (map.hasOwnProperty(key))
                    res.push(map[key]);
            return res;
        };

        /**
         * Convert the query columns into the tables' fields to select.
         * @param {TeqFw_Db_StringMap} columns
         * @param {TeqFw_Db_StringMap} map
         * @returns {TeqFw_Db_ObjectArray}
         * @deprecated
         * @see TeqFw_Db_Back_Util_ListQuery
         */
        this.prepareSelect = function(columns, map) {
            const res = [];
            for (const key of Object.values(columns)) {
                if (map.hasOwnProperty(key)) {
                    const obj = {};
                    obj[key] = map[key];
                    res.push(obj);
                }
            }
            return res;
        };
    }
}

// MAIN
const me = new TeqFw_Db_Back_Util();
