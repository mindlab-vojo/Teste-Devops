import {field} from '@liaison/liaison';
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

    async $resolvePropertyOperationSetting(setting) {
      const resolvedSetting = await super.$resolvePropertyOperationSetting(setting);

      if (resolvedSetting !== undefined) {
        return resolvedSetting;
      }

      if (this.$isNew()) {
        return;
      }

      await this.$ghost.$load({fields: {author: {}}});

      const isAuthor = this.$ghost.author === this.$layer.session.user.$ghost;

      if (!isAuthor) {
        return setting.has('other');
      }

      if (setting.has('author')) {
        return true;
      }
    }

    async $beforeSave() {
      const {session} = this.$layer;
      await super.$beforeSave();
      if (this.$isNew()) {
        this.author = session.user;
      }
    }
  };
