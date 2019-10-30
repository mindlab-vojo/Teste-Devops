import {field, role} from '@liaison/liaison';
import {WithAuthor as BaseWithAuthor} from '@liaison/react-liaison-realworld-example-app-shared';

export const WithAuthor = Base =>
  class WithAuthor extends BaseWithAuthor(Base) {
    @field({expose: {get: 'any'}}) author;

    @field('boolean?', {
      expose: {get: 'user'},
      async finder(value) {
        const {session} = this.$layer;
        if (value !== true) {
          throw new Error('$find() filter is unsupported');
        }
        await session.user.$load({fields: {followedUsers: {}}});
        return {author: session.user.followedUsers};
      }
    })
    authorIsFollowedBySessionUser;

    @role({name: 'author'}) async authorRole() {
      if (this.$hasRole('creator') || this.$hasRole('guest')) {
        return undefined;
      }

      await this.$ghost.$load({fields: {author: {}}});

      return this.$ghost.author === this.$layer.session.user.$ghost;
    }

    @role() async other() {
      const hasAuthorRole = await this.$hasRole('author');

      if (hasAuthorRole === undefined) {
        return undefined;
      }

      return !hasAuthorRole;
    }

    async $beforeSave() {
      const {session} = this.$layer;
      await super.$beforeSave();
      if (this.$isNew()) {
        this.author = session.user;
      }
    }
  };
