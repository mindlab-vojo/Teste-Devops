import React from 'react';
import {Registerable} from '@liaison/liaison';
import {view, useModel, useAsyncMemo} from '@liaison/react-integration';

export class Main extends Registerable() {
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

    useModel(authenticator);

    const [user, userIsLoading] = useAsyncMemo(async () => {
      return await authenticator.getUser();
    }, [authenticator.token]);

    return (
      <div>
        <h1>Conduit</h1>
        {!userIsLoading && user && (
          <p>
            {user.username}{' '}
            <button
              onClick={() => {
                authenticator.logout();
              }}
            >
              Sign out
            </button>
          </p>
        )}
        {!userIsLoading && !user && (
          <p>
            <router.Link href={authenticator.Login.getPath()}>Sign in</router.Link>
            &nbsp;&nbsp;&nbsp;
            <router.Link href={authenticator.Register.getPath()}>Sign up</router.Link>
          </p>
        )}
      </div>
    );
  }
}
