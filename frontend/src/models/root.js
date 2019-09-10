import React from 'react';
import {Registerable} from '@liaison/liaison';
import {view} from '@liaison/react-integration';

export class Root extends Registerable() {
  @view() static Main() {
    const {router, common} = this.layer;

    router.use();

    const content = router.callRoute({fallback: common.RouteNotFound});

    return (
      <div>
        <this.Header />
        {content}
      </div>
    );
  }

  @view() static Header() {
    const {authenticator, router} = this.layer;

    return (
      <div>
        <h1>Conduit</h1>
        <authenticator.Loader>
          {user => {
            if (user) {
              return (
                <p>
                  <router.Link href={user.constructor.Settings.getPath(user)}>
                    {user.username}
                  </router.Link>
                </p>
              );
            }

            return (
              <p>
                <router.Link href={authenticator.Login.getPath()}>Sign in</router.Link>
                &nbsp;&nbsp;&nbsp;
                <router.Link href={authenticator.Register.getPath()}>Sign up</router.Link>
              </p>
            );
          }}
        </authenticator.Loader>
      </div>
    );
  }
}
