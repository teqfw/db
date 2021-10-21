const ENTITY = '/complex/pkey';

const ATTR = {
    KEY_NUM: 'key_num',
    KEY_STR: 'key_str'
};

/**
 * @implements TeqFw_Db_Back_RDb_Meta_IEntity
 */
export class Meta {

    constructor({plugin}) {

        this.getEntityName = () => `${plugin}${ENTITY}`;

        this.getAttributes = () => Object.values(ATTR);

        this.getPrimaryKey = () => [ATTR.KEY_NUM, ATTR.KEY_STR];
    }

}

// finalize code components for this es6-module
Object.freeze(ATTR);
Meta.ATTR = ATTR;
