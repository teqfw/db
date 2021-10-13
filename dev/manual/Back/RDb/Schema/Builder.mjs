import container from '../../../DevEnv.mjs'; // init development environment

// get database connector then execute the process
/** @type {TeqFw_Db_Back_RDb_IConnect} */
const conn = await container.get('TeqFw_Db_Back_RDb_IConnect$');
/** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Column} */
const TColumn = await container.get('TeqFw_Db_Back_Enum_Db_Type_Column$');
/** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Index} */
const TIndex = await container.get('TeqFw_Db_Back_Enum_Db_Type_Index$');
/** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Action} */
const TAction = await container.get('TeqFw_Db_Back_Enum_Db_Type_Action$');
/** @type {TeqFw_Db_Back_Dto_RDb_Table.Factory} */
const fTbl = await container.get('TeqFw_Db_Back_Dto_RDb_Table#Factory$');
/** @type {TeqFw_Db_Back_RDb_Schema_A_Builder} */
const builder = await container.get('TeqFw_Db_Back_RDb_Schema_A_Builder$');

// tables definition
const tables = {
    user: {
        name: 'user',
        comment: 'Users registry.',
        columns: [
            {name: "id", type: TColumn.INCREMENTS},
            {name: "date_created", type: TColumn.DATETIME, comment: 'Date-time for registration of the user.'}
        ]
    },
    profile: {
        name: 'user_profile',
        comment: 'User personification.',
        columns: [
            {name: 'user_ref', type: TColumn.INTEGER, unsigned: true},
            {name: 'name', type: TColumn.STRING, comment: 'Name to display in profile.'},
        ],
        indexes: [
            {type: TIndex.PRIMARY, columns: ['user_ref']}
        ],
        relations: [
            {
                name: 'user_profile_user', ownColumns: ['user_ref'],
                itsTable: 'user', itsColumns: ['id'],
                onDelete: TAction.CASCADE, onUpdate: TAction.CASCADE
            }
        ],
    },
    password: {
        name: 'user_auth_password',
        comment: 'Authentication by password.',
        columns: [
            {name: 'login', type: TColumn.STRING, comment: 'Login name as user identity.'},
            {name: 'user_ref', type: TColumn.INTEGER, unsigned: true},
            {name: 'password_hash', type: TColumn.STRING},
        ],
        indexes: [
            {name: 'user_auth_password_PK', type: TIndex.PRIMARY, columns: ['login']},
            {name: 'user_auth_password_UQ_user', type: TIndex.UNIQUE, columns: ['user_ref']},
        ],
        relations: [
            {
                name: 'user_auth_password_FK_user', ownColumns: ['user_ref'],
                itsTable: 'user', itsColumns: ['id']
            }
        ],
    },
}

// DTOs for tables
const tblUser = fTbl.create(tables.user);
const tblProfile = fTbl.create(tables.profile);
const tblPassword = fTbl.create(tables.password);


// drop-create tables
/** @type {Knex.SchemaBuilder} */
const schema = conn.getSchemaBuilder();
builder.dropTable(schema, tblPassword);
builder.dropTable(schema, tblProfile);
builder.dropTable(schema, tblUser);
builder.addTable(schema, tblUser);
builder.addTable(schema, tblProfile);
builder.addTable(schema, tblPassword);
const sql = schema.toString();
await schema;

debugger

await conn.disconnect();
