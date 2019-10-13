import React from 'react';
import ReactDOM from 'react-dom';

import {createLayer} from './layer';

(async () => {
  let content;

  try {
    const layer = await createLayer();
    await layer.open();

    const {Root, session} = layer;

    await session.loadUser({
      fields: {email: true, username: true, bio: true, imageURL: true}
    });

    content = <Root.Main />;
  } catch (err) {
    console.error(err);

    content = <pre>{err.stack}</pre>;
  }

  ReactDOM.render(content, document.getElementById('root'));
})();
