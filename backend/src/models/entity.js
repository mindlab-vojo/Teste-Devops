import {Storable, field, WithRoles, role} from '@liaison/liaison';
import {Entity as BaseEntity} from '@liaison/react-liaison-realworld-example-app-shared';

export class Entity extends Storable(WithRoles(BaseEntity), {storeName: 'store'}) {
  @field({expose: {get: 'any'}}) createdAt;

  @field() updatedAt;

  @role() static any() {
    return true;
  }

  @role() creator() {
    return this.$isNew();
  }

  @role() static user() {
    return this.$layer.session.user !== undefined;
  }

  @role() static guest() {
    return !this.$hasRole('user');
  }

  async $beforeSave() {
    await super.$beforeSave();

    if (this.$isNew()) {
      this.createdAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
  }
}
