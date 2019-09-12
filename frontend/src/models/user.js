import React, {useState, useMemo} from 'react';
import {Routable, route} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import {view, useAsyncCallback} from '@liaison/react-integration';

export class User extends Routable(BaseUser) {
  @route('/register') @view() static Register() {
    const {Home} = this.layer;

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
                <this.Login.Link>Have an account?</this.Login.Link>
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

  static async register({email, username, password} = {}) {
    const {authenticator} = this.layer;

    const user = await super.register({email, username, password});
    authenticator.saveTokenToLocalStorage();
    authenticator.user = user;
    return user;
  }

  @route('/login') @view() static Login() {
    const {Home} = this.layer;

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
                <this.Register.Link>Need an account?</this.Register.Link>
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

  static async login({email, password} = {}) {
    const {authenticator} = this.layer;

    const user = await super.login({email, password});
    authenticator.saveTokenToLocalStorage();
    authenticator.user = user;
    return user;
  }

  static logout() {
    const {authenticator} = this.layer;

    authenticator.token = undefined;
    authenticator.saveTokenToLocalStorage();
    authenticator.user = undefined;
  }

  @route('/settings') @view() static Settings() {
    const {authenticator} = this.layer;

    return <authenticator.user.Settings />;
  }

  @view() Settings() {
    const {Home} = this.layer;

    const clone = useMemo(() => {
      return this.clone();
    }, []);

    const [handleUpdate, , updatingError] = useAsyncCallback(async () => {
      await this.update(clone);
      Home.Main.navigate();
    }, [clone]);

    return (
      <div className="settings-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Your Settings</h1>

              {updatingError && (
                <p>Sorry, something went wrong while updating your user information.</p>
              )}

              <clone.SettingsForm onSubmit={handleUpdate} />

              <hr />

              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  this.constructor.logout();
                  Home.Main.navigate();
                }}
              >
                Or click here to logout.
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @view() SettingsForm({onSubmit}) {
    const [handleSubmit, isSubmitting] = useAsyncCallback(
      async event => {
        event.preventDefault();
        await onSubmit();
      },
      [onSubmit]
    );

    return (
      <form onSubmit={handleSubmit} autoComplete="off">
        <fieldset>
          <fieldset className="form-group">
            <input
              className="form-control"
              type="url"
              placeholder="URL of profile picture"
              value={this.imageURL || ''}
              onChange={event => {
                this.imageURL = event.target.value || undefined;
              }}
            />
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={this.username}
              onChange={event => {
                this.username = event.target.value;
              }}
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows="8"
              placeholder="Short bio about you"
              value={this.bio || ''}
              onChange={event => {
                this.bio = event.target.value || undefined;
              }}
            ></textarea>
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={this.email}
              onChange={event => {
                this.email = event.target.value;
              }}
              autoComplete="off"
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="New password"
              value={this.password || ''}
              onChange={event => {
                this.password = event.target.value || undefined;
              }}
              autoComplete="new-password"
            />
          </fieldset>

          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={isSubmitting}
          >
            Update settings
          </button>
        </fieldset>
      </form>
    );
  }
}
