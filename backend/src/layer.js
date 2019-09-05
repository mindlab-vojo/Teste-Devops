import {Layer} from '@liaison/liaison';
import {MongoDBStore} from '@liaison/mongodb-store';

import {MONGODB_STORE_CONNECTION_STRING} from './environment';
import {Movie} from './models/movie';

const connectionString = MONGODB_STORE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error(`'MONGODB_STORE_CONNECTION_STRING' environment variable is missing`);
}

const store = new MongoDBStore(connectionString);

export const layer = new Layer({Movie, store}, {name: 'backend'});
