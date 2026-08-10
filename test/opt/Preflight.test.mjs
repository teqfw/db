import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {describe, it} from 'node:test';
import {cfg, container, localCfg} from '../TestEnv.mjs';

const REQUIRED_MARIADB_PRIVILEGES = Object.freeze([
    'ALTER', 'CREATE', 'DELETE', 'DROP', 'INDEX', 'INSERT', 'REFERENCES', 'SELECT', 'UPDATE',
]);

function assertConnectionConfig(name, value, client) {
    assert.equal(value?.client, client, `${name}.client must be ${client}.`);
    for (const field of ['database', 'host', 'password', 'user']) {
        assert.equal(typeof value?.connection?.[field], 'string', `${name}.connection.${field} must be a string.`);
        assert.ok(value.connection[field].length > 0, `${name}.connection.${field} must not be empty.`);
    }
}

async function connect(key) {
    const result = await container.get('TeqFw_Db_Back_RDb_Connect$$');
    await result.init({...localCfg[key], acquireConnectionTimeout: 5000});
    return result;
}

function versionAtLeast(actual, minimum) {
    const parse = (value) => String(value).match(/\d+/g)?.slice(0, 3).map(Number) ?? [];
    const left = parse(actual);
    const right = parse(minimum);
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
        const difference = (left[i] ?? 0) - (right[i] ?? 0);
        if (difference !== 0) return difference > 0;
    }
    return true;
}

describe('opt-in database preflight', () => {
    it('loads an explicit ignored project dotenv configuration', () => {
        const filename = join(cfg.path.root, '.env');
        assert.equal(existsSync(filename), true, `Create the ignored dotenv configuration at ${filename}.`);
        assertConnectionConfig('mariadb', localCfg.mariadb, 'mysql2');
        assertConnectionConfig('pg', localCfg.pg, 'pg');
    });

    it('accepts an empty MariaDB database with destructive-test privileges', async () => {
        const connection = await connect('mariadb');
        try {
            const adapter = connection.getDialectAdapter();
            assert.equal((await adapter.describe()).id, 'mysql');

            const knex = connection.getKnex();
            const [identityRows] = await knex.raw(
                'select version() as server_version, database() as database_name'
            );
            assert.match(identityRows[0].server_version, /MariaDB/i);
            assert.equal(identityRows[0].database_name, localCfg.mariadb.connection.database);

            const [tableRows] = await knex.raw(
                'select count(*) as table_count from information_schema.tables '
                + 'where table_schema = database() and table_type = ?',
                ['BASE TABLE']
            );
            assert.equal(Number(tableRows[0].table_count), 0,
                'The MariaDB opt-in database must contain no base tables before destructive tests.');

            const [privilegeRows] = await knex.raw(`
                select privilege_type
                from information_schema.schema_privileges
                where table_schema = database()
                  and grantee = concat(
                    quote(substring_index(current_user(), '@', 1)),
                    '@',
                    quote(substring_index(current_user(), '@', -1))
                  )
            `);
            const privileges = new Set(privilegeRows.map((row) => row.PRIVILEGE_TYPE ?? row.privilege_type));
            for (const privilege of REQUIRED_MARIADB_PRIVILEGES) {
                assert.equal(privileges.has(privilege), true,
                    `The MariaDB opt-in account requires ${privilege} on the configured database.`);
            }
        } finally {
            await connection.disconnect();
        }
    });

    it('accepts an empty PostgreSQL database with pgvector and destructive-test privileges', async () => {
        const connection = await connect('pg');
        try {
            const adapter = connection.getDialectAdapter();
            assert.equal((await adapter.describe()).id, 'postgresql');

            const knex = connection.getKnex();
            const identity = await knex.raw(`
                select version() as server_version,
                       current_database() as database_name,
                       has_database_privilege(current_user, current_database(), 'CREATE') as database_create,
                       has_schema_privilege(current_user, current_schema(), 'CREATE') as schema_create,
                       has_schema_privilege(current_user, current_schema(), 'USAGE') as schema_usage
            `);
            assert.match(identity.rows[0].server_version, /PostgreSQL/i);
            assert.equal(identity.rows[0].database_name, localCfg.pg.connection.database);
            assert.equal(identity.rows[0].database_create, true,
                'The PostgreSQL opt-in account requires CREATE on the configured database.');
            assert.equal(identity.rows[0].schema_create, true,
                'The PostgreSQL opt-in account requires CREATE on the current schema.');
            assert.equal(identity.rows[0].schema_usage, true,
                'The PostgreSQL opt-in account requires USAGE on the current schema.');

            const tables = await knex.raw(`
                select count(*) as table_count
                from information_schema.tables
                where table_schema not in ('pg_catalog', 'information_schema')
                  and table_type = 'BASE TABLE'
            `);
            assert.equal(Number(tables.rows[0].table_count), 0,
                'The PostgreSQL opt-in database must contain no user base tables before destructive tests.');

            const extension = await knex.raw("select extversion from pg_extension where extname = 'vector'");
            assert.ok(extension.rows[0],
                'Install the PostgreSQL vector extension separately before destructive opt-in tests.');
            assert.equal(versionAtLeast(extension.rows[0].extversion, '0.7.0'), true,
                'The PostgreSQL vector extension must be version 0.7.0 or newer.');
        } finally {
            await connection.disconnect();
        }
    });
});
