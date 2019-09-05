import React from 'react';
import {Model} from '@liaison/liaison';
import {view} from '@liaison/react-integration';

export class Home extends Model {
  @view() static Main() {
    const {router, common} = this.layer;

    router.use();

    const content = router.callRoute({fallback: common.RouteNotFound});

    return (
      <div>
        <h1>Conduit</h1>
        {content}
      </div>
    );
  }
}
