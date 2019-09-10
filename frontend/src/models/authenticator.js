import React, {useState} from 'react';
import {Routable, route} from '@liaison/liaison';
import {view, useAsyncMemo, useAsyncCallback} from '@liaison/react-integration';
import {Authenticator as BaseAuthenticator} from '@liaison/react-liaison-realworld-example-app-shared';

export class Authenticator extends Routable(BaseAuthenticator) {
  loadTokenFromLocalStorage() {
    this.token = window.localStorage.getItem('token') || undefined;
  }

  saveTokenToLocalStorage() {
    if (this.token !== undefined) {
      window.localStorage.setItem('token', this.token);
    } else {
      window.localStorage.removeItem('token');
    }
  }

  async register({email, username, password} = {}) {
    const user = await super.register({email, username, password});
    this.saveTokenToLocalStorage();
    return user;
  }

  async login({email, password} = {}) {
    const user = await super.login({email, password});
    this.saveTokenToLocalStorage();
    return user;
  }

  logout() {
    this.token = undefined;
    this.saveTokenToLocalStorage();
  }

  @view() Loader({children}) {
    const {common} = this.layer;

    const [user, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      return await this.getUser();
    }, [this.token]);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return (
        <common.ErrorMessage
          message="Sorry, something went wrong while loading your user information."
          onRetry={retryLoading}
        />
      );
    }

    return children(user);
  }

  @route('/register') @view() Register() {
    const {Home, authenticator, router} = this.layer;

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [handleRegister, isRegistering] = useAsyncCallback(async () => {
      await this.register({email, username, password});
      Home.Main.navigate();
    }, [email, username, password]);

    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign Up</h1>

              <p className="text-xs-center">
                <router.Link href={authenticator.Login.getPath()}>Have an account?</router.Link>
              </p>

              <form
                onSubmit={event => {
                  event.preventDefault();
                  handleRegister();
                }}
              >
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={event => setUsername(event.target.value)}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={isRegistering}
                  >
                    Sign up
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @route('/login') @view() Login() {
    const {Home, authenticator, router} = this.layer;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [handleLogin, isLogining] = useAsyncCallback(async () => {
      await this.login({email, password});
      Home.Main.navigate();
    }, [email, password]);

    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign In</h1>

              <p className="text-xs-center">
                <router.Link href={authenticator.Register.getPath()}>Need an account?</router.Link>
              </p>

              <form
                onSubmit={event => {
                  event.preventDefault();
                  handleLogin();
                }}
              >
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      required
                    />
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={isLogining}
                  >
                    Sign in
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
