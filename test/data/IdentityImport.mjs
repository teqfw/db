import assert from 'node:assert/strict';
import commandFactory from '../../src/Back/Cli/Import.mjs';
import {identity, tableFor} from './Identity.mjs';

export async function importIdentityRows(connection, compilation, dump) {
    const errors = [];
    let stopped = false;
    let serialRestored = false;
    const command = commandFactory({
        DEF: {CLI_PREFIX: 'db'},
        logger: {forSource: () => ({info() {}, error(message, detail) {errors.push(detail?.err ?? message);}})},
        fCommand: {create: () => ({opts: []})}, fOpt: {create: () => ({})},
        app: {async stop() {stopped = true;}}, conn: connection,
        util: {
            async itemsInsert(trx, name, rows) { if (rows.length) await trx.getKnexTrx()(name).insert(rows); },
            async pgSerialsSet() { serialRestored = true; },
        },
        utilFile: {readJson: () => dump},
        transform: {prepareTables: (trx, tables, name) => tables[name] ?? [], prepareSerials: (serials) => serials},
        aDemTables: {async act() { return compilation.graph.topological.map((entity) => tableFor(compilation, entity)); }},
        identity,
        schema: {getCompilation: () => compilation},
    });
    await command.action({file: '/fixture/import.json'});
    assert.deepEqual(errors, []);
    assert.equal(stopped, true);
    assert.equal(serialRestored, false);
}
