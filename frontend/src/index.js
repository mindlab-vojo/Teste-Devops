import React from 'react';
import ReactDOM from 'react-dom';

import {Application} from './application';
import {Root} from './components/root';

(async () => {
  let element;

  try {
    const app = new Application();
    await app.initialize();
    element = <Root app={app} />;
  } catch (err) {
    console.error(err);
    element = <pre>{err.stack}</pre>;
  }

  ReactDOM.render(element, document.getElementById('root'));
})();
