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
    const {Home} = this.layer;

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [handleRegister, isRegistering] = useAsyncCallback(async () => {
      await this.register({email, username, password});
      Home.Main.navigate();
    }, [email, username, password]);

    return (
      <div>
        <h2>Sign Up</h2>
        <form
          onSubmit={event => {
            event.preventDefault();
            handleRegister();
          }}
        >
          <table>
            <tbody>
              <tr>
                <td>Username:</td>
                <td>
                  <input value={username} onChange={event => setUsername(event.target.value)} />
                </td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Password:</td>
                <td>
                  <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <button type="submit" disabled={isRegistering}>
              Sign up
            </button>
          </p>
        </form>
      </div>
    );
  }

  @route('/login') @view() Login() {
    const {Home} = this.layer;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [handleLogin, isLogining] = useAsyncCallback(async () => {
      await this.login({email, password});
      Home.Main.navigate();
    }, [email, password]);

    return (
      <div>
        <h2>Sign In</h2>
        <form
          onSubmit={event => {
            event.preventDefault();
            handleLogin();
          }}
        >
          <table>
            <tbody>
              <tr>
                <td>Email:</td>
                <td>
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Password:</td>
                <td>
                  <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <button type="submit" disabled={isLogining}>
              Sign in
            </button>
          </p>
        </form>
      </div>
    );
  }
}
