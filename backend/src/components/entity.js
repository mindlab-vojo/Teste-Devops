import {Component, consume, expose} from '@layr/component';
import {Storable, primaryIdentifier, attribute} from '@layr/storable';
import {WithRoles, role} from '@layr/with-roles';

export class Entity extends WithRoles(Storable(Component)) {
  @consume() static Session;

  @expose({get: true, set: true}) @primaryIdentifier() id;

  @expose({get: 'anyone'}) @attribute('Date') createdAt = new Date();

  @attribute('Date?') updatedAt;

  @role('anyone') static anyoneRoleResolver() {
    return true;
  }

  @role('user') static userRoleResolver() {
    return this.Session.user !== undefined;
  }

  @role('guest') static guestRoleResolver() {
    return !this.resolveRole('user');
  }

  async beforeSave() {
    await super.beforeSave();

    this.updatedAt = new Date();
  }
}
