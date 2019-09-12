import {Authenticator as BaseAuthenticator} from '@liaison/react-liaison-realworld-example-app-shared';

export class Authenticator extends BaseAuthenticator {
  // TODO: Implement field getter/setter so we can get rid of these methods

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
}
