import {field, expose} from '@liaison/liaison';
import {WithAuthor as BaseWithAuthor} from '@liaison/react-liaison-realworld-example-app-shared';

export const WithAuthor = Base =>
  class WithAuthor extends BaseWithAuthor(Base) {
    @expose({get: 'any'}) author;

    @expose({get: 'user'})
    @field('boolean?', {
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

    async $exposedPropertyOperationIsAllowed({property, operation, setting}) {
      const isAllowed = await super.$exposedPropertyOperationIsAllowed({
        property,
        operation,
        setting
      });

      if (isAllowed !== undefined) {
        return isAllowed;
      }

      const isAuthor = await this.authorIsSessionUser();

      if (!isAuthor) {
        return setting.has('other');
      }

      if (setting.has('author')) {
        return true;
      }
    }

    async authorIsSessionUser() {
      if (this._authorIsSessionUser === undefined) {
        if (this.$isNew()) {
          this._authorIsSessionUser = true;
        } else {
          const fork = this.$fork();
          await fork.$load({fields: {author: {}}});
          // TODO: Don't use 'id'
          this._authorIsSessionUser = fork.author.id === this.$layer.session.user.id;
        }
      }
      return this._authorIsSessionUser;
    }

    async $beforeSave() {
      const {session} = this.$layer;
      await super.$beforeSave();
      if (this.$isNew()) {
        this.author = session.user;
      }
    }
  };
