import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {Root, Authenticator, Home, User, Common} from './models';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = await client.connect();

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const common = new Common();

  const authenticator = Authenticator.deserialize();

  authenticator.loadTokenFromLocalStorage();

  const layer = new Layer(
    {authenticator, Root, Home, User, common, router},
    {name: 'frontend', parent: backendLayer}
  );

  return layer;
}
