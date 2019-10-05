import {Storable, store, expose} from '@liaison/liaison';
import {Entity as BaseEntity} from '@liaison/react-liaison-realworld-example-app-shared';

export class Entity extends Storable(BaseEntity, {storeName: 'store'}) {
  @expose({read: 'any'}) @store() createdAt;

  @expose({read: 'any'}) @store() updatedAt;

  async $beforeSave() {
    await super.$beforeSave();

    if (this.$isNew()) {
      this.createdAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
  }
}
