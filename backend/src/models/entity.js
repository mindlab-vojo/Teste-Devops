import {Storable, field} from '@liaison/liaison';
import {Entity as BaseEntity} from '@liaison/react-liaison-realworld-example-app-shared';

export class Entity extends Storable(BaseEntity, {storeName: 'store'}) {
  @field({expose: {get: 'any'}}) createdAt;

  @field({expose: {get: 'any'}}) updatedAt;

  static async $resolvePropertyOperationSetting(setting) {
    const resolvedSetting = super.$resolvePropertyOperationSetting(setting);

    if (resolvedSetting !== undefined) {
      return resolvedSetting;
    }

    if (setting.has('any')) {
      return true;
    }

    if (setting.has('none')) {
      return false;
    }

    if (setting.has('creator') && this.$isNew()) {
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

  static $normalizePropertyOperationSetting(setting) {
    let normalizedSetting = super.$normalizePropertyOperationSetting(setting);

    if (normalizedSetting !== undefined) {
      return normalizedSetting;
    }

    normalizedSetting = setting;

    if (typeof normalizedSetting === 'string') {
      normalizedSetting = [normalizedSetting];
    }

    if (
      !(
        Array.isArray(normalizedSetting) &&
        normalizedSetting.every(item => typeof item === 'string')
      )
    ) {
      throw new Error(`Invalid property operation setting (${JSON.stringify(normalizedSetting)})`);
    }

    normalizedSetting = normalizedSetting.filter(item => item !== '');

    if (normalizedSetting.length === 0) {
      return undefined;
    }

    return new Set(normalizedSetting);
  }

  static $serializePropertyOperationSetting(setting) {
    let serializedSetting = super.$normalizePropertyOperationSetting(setting);

    if (serializedSetting !== undefined) {
      return serializedSetting;
    }

    serializedSetting = Array.from(setting);

    return serializedSetting;
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
