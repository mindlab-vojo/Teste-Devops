import {field, store, expose} from '@liaison/liaison';
import {WithAuthor as BaseWithAuthor} from '@liaison/react-liaison-realworld-example-app-shared';

export const WithAuthor = Base =>
  class WithAuthor extends BaseWithAuthor(Base) {
    @expose({read: 'any'}) @store() author;

    @expose({read: 'user'})
    @field('boolean?', {
      async finder(value) {
        const {session} = this.$layer;

        if (value !== true) {
          throw new Error('$find() filter is unsupported');
        }

        const authenticatedUser = await session.loadUser({fields: {followedUsers: {}}});

        return {author: authenticatedUser.followedUsers};
      }
    })
    authorIsFollowedByAuthenticatedUser;

    async $beforeSave() {
      const {session} = this.$layer;

      await super.$beforeSave();

      if (this.$isNew()) {
        this.author = await session.loadUser();
      }
    }
  };
