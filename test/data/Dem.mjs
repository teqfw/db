import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const root = new URL('../..', import.meta.url).pathname;
const filename = join(root, 'etc/teqfw.schema.json');
const declaration = Object.freeze(JSON.parse(readFileSync(filename, 'utf8')));

/**
 * Return the package-owned DEM as an ordinary trusted test envelope.
 * @returns {object}
 */
export function platformFragment() {
    return {
        declaration,
        filename,
        fragmentId: '@teqfw/db',
        packageName: '@teqfw/db',
    };
}
