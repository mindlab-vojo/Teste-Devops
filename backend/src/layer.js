import {Layer} from '@liaison/liaison';
import {MongoDBStore} from '@liaison/mongodb-store';

import {MONGODB_STORE_CONNECTION_STRING, JWT_SECRET} from './environment';
import {Article} from './models/article';
import {Comment} from './models/comment';
import {User} from './models/user';
import {Session} from './models/session';
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

const session = Session.$deserialize();

const layer = new Layer(
  {Article, Comment, User, session, store, jwt},
  {
    name: 'backend',
    async beforeInvokeReceivedQuery({session}) {
      await session.loadUser({fields: {}});
    }
  }
);

export async function createLayer() {
  return layer.fork();
}
