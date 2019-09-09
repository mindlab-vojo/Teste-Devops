import {Model, field} from '@liaison/liaison';

export class Authenticator extends Model {
  @field('string?') token;

  hasToken() {
    return this.token !== undefined;
  }

  clearToken() {
    this.token = undefined;
  }
}
