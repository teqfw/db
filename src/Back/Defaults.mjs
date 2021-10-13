/**
 * Plugin level constants (hardcoded configuration).
 */
export default class TeqFw_Db_Back_Defaults {

    NAME = '@teqfw/db'; // plugin's node in 'teqfw.json' & './cfg/local.json'
    PS = '/'; // path separator for DEM entities ('/path/to/entity')
    NS = '_'; // name separator for DB elements ('table_name')

    constructor() {
        Object.freeze(this);
    }
}
