import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {App, Root, Home, User, Authenticator, Common} from './models';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = await client.connect();

  const app = new App({name: 'Conduit', description: 'A place to share your knowledge.'});

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const authenticator = Authenticator.deserialize();

  const common = new Common();

  authenticator.loadTokenFromLocalStorage();

  const layer = new Layer(
    {app, Root, Home, User, common, authenticator, router},
    {name: 'frontend', parent: backendLayer}
  );

  return layer;
}
