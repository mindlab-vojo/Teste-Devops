import {field, role} from '@liaison/liaison';
import {WithAuthor as BaseWithAuthor} from '@liaison/react-liaison-realworld-example-app-shared';

export const WithAuthor = Base =>
  class WithAuthor extends BaseWithAuthor(Base) {
    @field({expose: {get: 'anyone'}}) author;

    @field('boolean?', {
      expose: {get: 'user'},

      async finder() {
        const {session} = this.$layer;

        await session.user.$load({fields: {followedUsers: {}}});

        return {author: session.user.followedUsers};
      }
    })
    authorIsFollowedBySessionUser;

    @role('author') async authorRoleResolver() {
      if (this.$resolveRole('creator') || this.$resolveRole('guest')) {
        return undefined;
      }

      await this.$ghost.$load({fields: {author: {}}});

      return this.$ghost.author === this.$layer.session.user.$ghost;
    }

    async $beforeSave() {
      await super.$beforeSave();

      if (this.$isNew()) {
        this.author = this.$layer.session.user;
      }
    }
  };
