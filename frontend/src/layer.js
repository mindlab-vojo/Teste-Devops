import {Layer, BrowserRouter} from '@liaison/liaison';
import {LayerHTTPClient} from '@liaison/layer-http-client';
import {ReactRouterPlugin} from '@liaison/react-integration';

import {BACKEND_URL} from './environment';
import {Home, MovieList, Movie, Common} from './models';

export async function createLayer() {
  const client = new LayerHTTPClient(BACKEND_URL);
  const backendLayer = await client.connect();

  const router = new BrowserRouter({plugins: [ReactRouterPlugin()]});

  const common = new Common();

  const layer = new Layer(
    {Home, MovieList, Movie, common, router},
    {name: 'frontend', parent: backendLayer}
  );

  return layer;
}
