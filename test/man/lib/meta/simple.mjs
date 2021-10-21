const ENTITY = '/simple';

const ATTR = {
    ID: 'id',
    DATE_CREATED: 'date_created'
};

/**
 * @implements TeqFw_Db_Back_RDb_Meta_IEntity
 */
export class Meta {

    constructor({plugin}) {

        this.getEntityName = () => `${plugin}${ENTITY}`;

        this.getAttributes = () => Object.values(ATTR);

        this.getPrimaryKey = () => [ATTR.ID];
    }

}

// finalize code components for this es6-module
Object.freeze(ATTR);
Meta.ATTR = ATTR;
