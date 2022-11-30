/**
 * Plugin level constants (hardcoded configuration).
 */
export default class TeqFw_Db_Back_Defaults {
    NAME = '@teqfw/db'; // plugin's node in 'teqfw.json' & './cfg/local.json'

    CLI_PREFIX = 'db'; // prefix for CLI actions
    NS = '_'; // name separator for DB elements ('table_name')
    PS = '/'; // path separator for DEM entities ('/path/to/entity')
    SCOPE_CHAR = '@'; // marker for NPM scope (@vnd/plugin)

    constructor() {
        Object.freeze(this);
    }
}
