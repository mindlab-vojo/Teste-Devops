import {Model, field, validators} from '@liaison/liaison';

const {rangeLength} = validators;

export class Session extends Model {
  @field('string?', {validators: [rangeLength([10, 250])]}) token;

  async loadUser({fields} = {}) {
    if (!this._userHasBeenLoaded) {
      if (this.token !== undefined) {
        this.user = await this.loadUserFromToken({fields});
      }
      this._userHasBeenLoaded = true;
    }
  }
}
