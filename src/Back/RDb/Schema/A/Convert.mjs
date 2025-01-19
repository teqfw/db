/**
 * Convert DEM DTO Entity to RDB DTO Table.
 *
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_RDb_Schema_A_Convert {
    /**
     * @param {TeqFw_Db_Back_Defaults} DEF
     * @param {TeqFw_Db_Back_Dto_RDb_Column.Factory} fColumn
     * @param {TeqFw_Db_Back_Dto_RDb_Index.Factory} fIndex
     * @param {TeqFw_Db_Back_Dto_RDb_Relation.Factory} fRelation
     * @param {TeqFw_Db_Back_Dto_RDb_Table.Factory} fTable
     * @param {typeof TeqFw_Db_Back_Enum_Dem_Type_Attr} TDemAttr
     * @param {typeof TeqFw_Db_Back_Enum_Dem_Type_Index} TDemIndex
     * @param {typeof TeqFw_Db_Back_Enum_Dem_Type_Action} TDemAction
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Column} TDbColType
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Index} TDbIndexType
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Action} TDbActionType
     */

    constructor(
        {
            TeqFw_Db_Back_Defaults$: DEF,
            'TeqFw_Db_Back_Dto_RDb_Column.Factory$': fColumn,
            'TeqFw_Db_Back_Dto_RDb_Index.Factory$': fIndex,
            'TeqFw_Db_Back_Dto_RDb_Relation.Factory$': fRelation,
            'TeqFw_Db_Back_Dto_RDb_Table.Factory$': fTable,
            TeqFw_Db_Back_Enum_Dem_Type_Attr$: TDemAttr,
            TeqFw_Db_Back_Enum_Dem_Type_Index$: TDemIndex,
            TeqFw_Db_Back_Enum_Dem_Type_Action$: TDemAction,
            TeqFw_Db_Back_Enum_Db_Type_Column$: TDbColType,
            TeqFw_Db_Back_Enum_Db_Type_Index$: TDbIndexType,
            TeqFw_Db_Back_Enum_Db_Type_Action$: TDbActionType,
        }) {
        // VARS
        const mapAction = {
            [TDemAction.CASCADE]: TDbActionType.CASCADE,
            [TDemAction.RESTRICT]: TDbActionType.RESTRICT,
        };
        const mapAttr2Cols = {
            [TDemAttr.BINARY]: TDbColType.BINARY,
            [TDemAttr.BOOLEAN]: TDbColType.BOOLEAN,
            [TDemAttr.DATETIME]: TDbColType.DATETIME,
            [TDemAttr.ENUM]: TDbColType.ENUM,
            [TDemAttr.ID]: TDbColType.INCREMENTS,
            [TDemAttr.INTEGER]: TDbColType.INTEGER,
            [TDemAttr.JSON]: TDbColType.JSONB,
            [TDemAttr.NUMBER]: TDbColType.DECIMAL,
            [TDemAttr.REF]: TDbColType.INTEGER,
            [TDemAttr.STRING]: TDbColType.STRING,
            [TDemAttr.TEXT]: TDbColType.TEXT,
        };
        const mapIndex = {
            [TDemIndex.INDEX]: TDbIndexType.INDEX,
            [TDemIndex.PRIMARY]: TDbIndexType.PRIMARY,
            [TDemIndex.UNIQUE]: TDbIndexType.UNIQUE,
        };

        // FUNCS
        /**
         * Normalize table name.
         * @param {string} name
         * @returns {string}
         */
        function normName(name) {
            const res = name.replace(new RegExp(DEF.PS, 'g'), DEF.NS);
            return (res[0] === DEF.NS) ? res.substr(1) : res;
        }

        // INSTANCE METHODS
        /**
         * Convert DEM DTO Entity to RDB DTO Table.
         *
         * @param {TeqFw_Db_Back_Dto_Dem_Entity} entity
         * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
         * @returns {Promise<TeqFw_Db_Back_Dto_RDb_Table>}
         */
        this.exec = async function ({entity, cfg}) {
            // FUNCS
            /**
             * @param {TeqFw_Db_Back_Dto_RDb_Table} tbl
             * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr} dem
             */
            function convertAttr(tbl, dem) {
                const col = fColumn.create();
                col.name = dem.name;
                col.comment = dem.comment;
                col.type = mapAttr2Cols[dem.type];
                if ((dem.type === TDemAttr.DATETIME) && (dem.options?.dateOnly === true)) col.type = TDbColType.DATE;
                // parse argument options
                if (dem.type === TDemAttr.ENUM) {
                    col.enum = dem.options.values;
                } else if (dem.type === TDemAttr.REF) {
                    col.unsigned = true;
                } else if (dem.type === TDemAttr.NUMBER) {
                    col.precision = dem?.options?.precision;
                    col.scale = dem?.options?.scale;
                    col.unsigned = dem?.options?.unsigned;
                    if (!col.scale && !col.precision) col.type = TDbColType.INTEGER;
                } else if (dem.type === TDemAttr.INTEGER) {
                    col.unsigned = dem?.options?.unsigned;
                    if (dem?.options?.isTiny) col.type = TDbColType.TINYINT;
                }
                if (dem?.options?.length) col.length = dem?.options.length;
                col.default = dem.default;
                col.nullable = dem.nullable;
                tbl.columns.push(col);
            }

            /**
             * @param {TeqFw_Db_Back_Dto_RDb_Table} tbl
             * @param {TeqFw_Db_Back_Dto_Dem_Entity_Index} dem
             */
            function convertIndex(tbl, dem) {
                const db = fIndex.create();
                db.name = `${tbl.name}${DEF.NS}${dem.name}`.toLowerCase();
                db.columns = dem.attrs;
                db.type = mapIndex[dem.type];
                tbl.indexes.push(db);
            }

            /**
             * @param {TeqFw_Db_Back_Dto_RDb_Table} tbl
             * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation} dem
             * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
             */
            function convertRelation(tbl, dem, cfg) {
                const db = fRelation.create();
                db.name = `${tbl.name}${DEF.NS}fk${DEF.NS}${dem.name}`.toLowerCase();
                db.ownColumns = dem.attrs;
                const prefix = (cfg?.prefix) ?? '';
                db.itsTable = normName(`${prefix}${dem.ref.path}`);
                db.itsColumns = dem.ref.attrs;
                if (dem?.action?.delete) db.onDelete = mapAction[dem.action.delete];
                if (dem?.action?.update) db.onUpdate = mapAction[dem.action.update];
                tbl.relations.push(db);
            }

            /**
             * Convert entity path & name to table name.
             * @param {TeqFw_Db_Back_Dto_Dem_Entity} entity
             * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
             * @returns {string}
             */
            function convertTableName(entity, cfg) {
                const prefix = (cfg?.prefix) ?? '';
                const res = `${prefix}${entity.path}${entity.name}`;
                return normName(res);
            }

            // MAIN
            const res = fTable.create();
            res.name = convertTableName(entity, cfg);
            res.comment = entity.comment;
            for (const aName of Object.keys(entity.attr))
                convertAttr(res, entity.attr[aName]);
            for (const iName of Object.keys(entity.index))
                convertIndex(res, entity.index[iName]);
            for (const rName of Object.keys(entity.relation))
                convertRelation(res, entity.relation[rName], cfg);
            return res;
        };

    }
}
