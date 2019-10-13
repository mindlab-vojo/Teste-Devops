import {Model, field, validators} from '@liaison/liaison';

const {rangeLength} = validators;

export class Session extends Model {
  @field('string?', {validators: [rangeLength([10, 250])]}) token;

  async loadUser({fields} = {}) {
    if (this.token === undefined) {
      return undefined;
    }

    this.user = await this.loadUserFromToken({fields});

    return this.user;
  }
}
