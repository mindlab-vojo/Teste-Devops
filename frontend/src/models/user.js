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
      <div>
        <h2>Your Settings</h2>
        {updatingError && <p>Sorry, something went wrong while updating your user information.</p>}
        <clone.SettingsForm onSubmit={handleUpdate} />
        <hr />
        <p>
          <button
            onClick={() => {
              authenticator.logout();
              Home.Main.navigate();
            }}
          >
            Sign out
          </button>
        </p>
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
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td>URL of profile picture:</td>
              <td>
                <input
                  type="url"
                  value={this.imageURL}
                  onChange={event => {
                    this.imageURL = event.target.value;
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Username:</td>
              <td>
                <input
                  value={this.username}
                  onChange={event => {
                    this.username = event.target.value;
                  }}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Sort bio about you:</td>
              <td>
                <textarea
                  value={this.bio}
                  onChange={event => {
                    this.bio = event.target.value;
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Email:</td>
              <td>
                <input
                  type="email"
                  value={this.email}
                  onChange={event => {
                    this.email = event.target.value;
                  }}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Password:</td>
              <td>
                <input
                  type="password"
                  value={this.getField('password').getOptionalValue('')}
                  onChange={event => {
                    this.password = event.target.value || undefined;
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <button type="submit" disabled={isSubmitting}>
            Update settings
          </button>
        </p>
      </form>
    );
  }
}
