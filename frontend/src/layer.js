import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {App, Root, Home, Article, ArticleList, User, Authenticator, Common} from './models';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = await client.connect();

  const app = new App({name: 'Conduit', description: 'A place to share your knowledge.'});

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const common = new Common();

  const authenticator = Authenticator.deserialize();
  authenticator.loadTokenFromLocalStorage();

  const layer = new Layer(
    {app, Root, Home, Article, ArticleList, User, common, authenticator, router},
    {name: 'frontend', parent: backendLayer}
  );

  await authenticator.loadUser();

  return layer;
}
