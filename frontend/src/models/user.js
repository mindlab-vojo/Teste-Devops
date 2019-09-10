import React, {useState} from 'react';
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

    const [imageURL, setImageURL] = useState(this.imageURL);

    const [handleUpdate, isUpdating] = useAsyncCallback(async () => {
      await this.update({imageURL});
      Home.Main.navigate();
    }, [imageURL]);

    return (
      <div>
        <h2>Settings</h2>
        <form
          onSubmit={event => {
            event.preventDefault();
            handleUpdate();
          }}
        >
          <table>
            <tbody>
              <tr>
                <td>URL of profile picture:</td>
                <td>
                  <input value={imageURL} onChange={event => setImageURL(event.target.value)} />
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <button type="submit" disabled={isUpdating}>
              Update settings
            </button>
          </p>
        </form>
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
}
