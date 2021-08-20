/**
 * Initialize development environment to run dev tests.
 */
import {join, dirname} from 'path';
import Container from '@teqfw/di';

/* Resolve paths to main folders */
const url = new URL(import.meta.url);
const script = url.pathname;
const pathScript = dirname(script);
const pathPrj = join(pathScript, '../..');
const pathNode = join(pathPrj, '../../../node_modules');
const srcTeqFwDi = join(pathNode, '@teqfw/di/src');
const srcTeqFwCore = join(pathNode, '@teqfw/core/src');
const srcTeqFwDb = join(pathNode, '@teqfw/db/src');

/* Create and setup DI container (once per all imports) */

/** @type {TeqFw_Di_Shared_Container} */
const container = new Container();
// add backend sources to map
container.addSourceMapping('TeqFw_Di', srcTeqFwDi, true, 'mjs');
container.addSourceMapping('TeqFw_Core', srcTeqFwCore, true, 'mjs');
container.addSourceMapping('TeqFw_Db', srcTeqFwDb, true, 'mjs');


export default container;
