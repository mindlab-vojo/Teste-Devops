import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {App} from './models/app';
import {Article} from './models/article';
import {ArticleList} from './models/article-list';
import {Authenticator} from './models/authenticator';
import {Comment} from './models/comment';
import {CommentList} from './models/comment-list';
import {Common} from './models/common';
import {Home} from './models/home';
import {Root} from './models/root';
import {User} from './models/user';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = client.getLayer();
  await backendLayer.open();

  const app = new App({name: 'Conduit', description: 'A place to share your knowledge.'});

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const common = new Common();

  const authenticator = Authenticator.$deserialize();
  authenticator.loadTokenFromLocalStorage();

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
      authenticator,
      router
    },
    {name: 'frontend', parent: backendLayer}
  );
}
