import React, {useMemo} from 'react';
import {Routable, route} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import {view, useAsyncCallback} from '@liaison/react-integration';

export class User extends Routable(BaseUser) {
  @route('/settings') @view() static Settings() {
    const {authenticator} = this.layer;

    return <authenticator.Loader>{user => (user ? <user.Settings /> : null)}</authenticator.Loader>;
  }

  @view() Settings() {
    const {Home, authenticator} = this.layer;

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
                  authenticator.logout();
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
              className="form-control form-control-lg"
              type="url"
              placeholder="URL of profile picture"
              value={this.imageURL}
              onChange={event => {
                this.imageURL = event.target.value;
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
              value={this.bio}
              onChange={event => {
                this.bio = event.target.value;
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
              value={this.getField('password').getOptionalValue() || ''}
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
