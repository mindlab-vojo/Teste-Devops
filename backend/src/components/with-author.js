import {expose} from '@liaison/component';
import {attribute, finder} from '@liaison/storable';
import {role} from '@liaison/with-roles';

export const WithAuthor = (Base) =>
  class WithAuthor extends Base {
    @expose({get: 'anyone'}) @attribute('User') author = this.constructor.Session.user;

    @expose({get: 'user'})
    @finder(async function () {
      const {user} = this.constructor.Session;

      await user.load({followedUsers: {}});

      return {author: {$in: user.followedUsers}};
    })
    @attribute('boolean?')
    authorIsFollowedBySessionUser;

    @role('author') async authorRoleResolver() {
      if (this.resolveRole('guest')) {
        return undefined;
      }

      if (this.isNew()) {
        return true;
      }

      await this.getGhost().load({author: {}});

      return this.getGhost().author === this.constructor.Session.user.getGhost();
    }
  };
