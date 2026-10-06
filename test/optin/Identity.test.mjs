import {identityConformance} from '../data/IdentityConformance.mjs';
import {localCfg} from '../TestEnv.mjs';

identityConformance('PostgreSQL', localCfg.pg, 'idpg');
identityConformance('MariaDB', localCfg.mariadb, 'idmy');
