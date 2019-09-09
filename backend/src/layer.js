import {Layer, expose} from '@liaison/liaison';
import {MongoDBStore} from '@liaison/mongodb-store';

import {MONGODB_STORE_CONNECTION_STRING, JWT_SECRET} from './environment';
import {Authenticator, User} from './models';
import {JWT} from './jwt';

const connectionString = MONGODB_STORE_CONNECTION_STRING;
if (!connectionString) {
  throw new Error(`'MONGODB_STORE_CONNECTION_STRING' environment variable is missing`);
}
const store = new MongoDBStore(connectionString);

const jwtSecret = JWT_SECRET;
if (!jwtSecret) {
  throw new Error(`'JWT_SECRET' environment variable is missing`);
}
const jwt = new JWT(jwtSecret);

const authenticator = expose(Authenticator.deserialize());

export const layer = new Layer({authenticator, User, store, jwt}, {name: 'backend'});
