import {Session as BaseSession} from '@liaison/react-liaison-realworld-example-app-shared';

export class Session extends BaseSession {
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
