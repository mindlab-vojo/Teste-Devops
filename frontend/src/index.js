import React from 'react';
import ReactDOM from 'react-dom';

import {createLayer} from './layer';

(async () => {
  let content;

  try {
    const layer = await createLayer();
    const {Home} = layer;
    content = <Home.Main />;
  } catch (err) {
    console.error(err);
    content = <pre>{err.stack}</pre>;
  }

  ReactDOM.render(content, document.getElementById('root'));
})();
