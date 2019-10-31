import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {App} from './models/app';
import {Article} from './models/article';
import {ArticleList} from './models/article-list';
import {Comment} from './models/comment';
import {CommentList} from './models/comment-list';
import {Common} from './models/common';
import {Home} from './models/home';
import {Root} from './models/root';
import {Session} from './models/session';
import {User} from './models/user';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = await client.$getLayer();

  const app = new App({name: 'Conduit', description: 'A place to share your knowledge.'});

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const common = new Common();

  const session = Session.$deserialize();

  return new Layer(
    {
      app,
      Root,
      Home,
      Article,
      ArticleList,
      Comment,
      CommentList,
      User,
      common,
      session,
      router
    },
    {name: 'frontend', parent: backendLayer}
  );
}
