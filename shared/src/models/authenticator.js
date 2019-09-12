import {Model, field, validators} from '@liaison/liaison';

const {rangeLength} = validators;

export class Authenticator extends Model {
  @field('string?', {validators: [rangeLength([10, 250])]}) token;

  async loadUser({fields} = {}) {
    if (this.token === undefined) {
      return undefined;
    }

    if (this.user) {
      return this.user;
    }

    this.user = await this.loadUserFromToken({fields});

    return this.user;
  }
}
