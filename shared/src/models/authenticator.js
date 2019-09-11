import {Model, field, validators} from '@liaison/liaison';

const {rangeLength} = validators;

export class Authenticator extends Model {
  @field('string?', {validators: [rangeLength([16, 256])]}) token;

  hasToken() {
    return this.token !== undefined;
  }

  clearToken() {
    this.token = undefined;
  }
}
