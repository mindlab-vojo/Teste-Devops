import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {Main, Authenticator, Home, User, Common} from './models';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = await client.connect();

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const common = new Common();

  const authenticator = new Authenticator();

  const layer = new Layer(
    {Main, authenticator, Home, User, common, router},
    {name: 'frontend', parent: backendLayer}
  );

  layer.register({Authenticator}); // TODO: get rid of this

  return layer;
}
