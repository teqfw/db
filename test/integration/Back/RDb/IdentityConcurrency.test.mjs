import {identityConformance} from '../../../data/IdentityConformance.mjs';

identityConformance('SQLite', {client: 'sqlite3', connection: {filename: ':memory:'}, useNullAsDefault: true}, 'idsql');
