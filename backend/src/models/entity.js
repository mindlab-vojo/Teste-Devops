import {Storable, expose} from '@liaison/liaison';
import {Entity as BaseEntity} from '@liaison/react-liaison-realworld-example-app-shared';

export class Entity extends Storable(BaseEntity, {storeName: 'store'}) {
  @expose({get: 'any'}) createdAt;

  @expose({get: 'any'}) updatedAt;

  static async $exposedPropertyOperationIsAllowed({property, operation, setting}) {
    const isAllowed = super.$exposedPropertyOperationIsAllowed({property, operation, setting});

    if (isAllowed !== undefined) {
      return isAllowed;
    }

    if (setting.has('any')) {
      return true;
    }

    if (setting.has('none')) {
      return false;
    }

    if (setting.has('new') && this.$isNew()) {
      return true;
    }

    const {session} = this.$layer;

    if (!session.user) {
      return setting.has('guest');
    }

    if (setting.has('user')) {
      return true;
    }
  }

  static $normalizeExposedPropertyOperationSetting(setting) {
    if (typeof setting === 'boolean') {
      return setting;
    }

    if (!Array.isArray(setting)) {
      setting = [setting];
    }

    return new Set(setting);
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
