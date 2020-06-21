import {Component, consume} from '@liaison/component';
import React, {useEffect} from 'react';
import {view, useBrowserRouter} from '@liaison/react-integration';

export class Root extends Component {
  @consume() static Frontend;
  @consume() static App;
  @consume() static Common;

  @view() static Main() {
    const {Frontend, App, Common} = this;

    useEffect(() => {
      document.title = App.name;
    }, [App.name]);

    const [router, isReady] = useBrowserRouter(Frontend);

    if (!isReady) {
      return null;
    }

    const content = router.callCurrentRoute({fallback: Common.RouteNotFound});

    return (
      <div>
        <App.Header />
        {content}
      </div>
    );
  }
}
