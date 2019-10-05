import {Storable, store, field, method, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

export class Article extends Storable(BaseArticle, {storeName: 'store'}) {
  @expose({read: 'any', write: 'author'}) @store() title;

  @expose({read: 'any', write: 'author'}) @store() description;

  @expose({read: 'any', write: 'author'}) @store() body;

  @expose({read: 'any'}) @store() slug;

  @expose({read: 'any'}) @store() author;

  @expose({read: 'any'}) @store() createdAt;

  @expose({read: 'any'}) @store() updatedAt;

  @expose({read: 'any'}) @store() favoritesCount;

  @expose({read: 'user'})
  @field({
    async finder(value) {
      // TODO: Remove this unused finder

      const {authenticator} = this.$layer;

      if (value !== true) {
        throw new Error('$find() filter is unsupported');
      }

      const authenticatedUser = await authenticator.loadUser({fields: {favoritedArticles: {}}});

      return authenticatedUser.favoritedArticles;
    }
  })
  isFavoritedByAuthenticatedUser;

  @expose({read: 'user'})
  @field({
    async finder(value) {
      const {authenticator} = this.$layer;

      if (value !== true) {
        throw new Error('$find() filter is unsupported');
      }

      const authenticatedUser = await authenticator.loadUser({fields: {followedUsers: {}}});

      return {author: authenticatedUser.followedUsers};
    }
  })
  authorIsFollowedByAuthenticatedUser;

  @expose({call: 'any'}) static $getId;

  @expose({call: 'any'}) static $load;

  async $afterLoad({fields}) {
    const {authenticator} = this.$layer;

    await super.$afterLoad({fields});

    if (fields.has('isFavoritedByAuthenticatedUser')) {
      const authenticatedUser = await authenticator.loadUser({fields: {favoritedArticles: {}}});

      this.isFavoritedByAuthenticatedUser =
        authenticatedUser && (await this.isFavoritedBy(authenticatedUser));
    }
  }

  @method({
    async finder(user) {
      await user.$load({fields: {favoritedArticles: {}}});
      return {$identity: user.favoritedArticles};
    }
  })
  async isFavoritedBy(user) {
    await user.$load({fields: {favoritedArticles: {}}});
    return user.favoritedArticles.includes(this);
  }

  @expose({call: 'author'}) static $save;

  async $beforeSave() {
    const {authenticator} = this.$layer;

    await super.$beforeSave();

    if (this.$isNew()) {
      this.author = await authenticator.loadUser();
      this.generateSlug();
      this.createdAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
  }

  @expose({call: 'user'}) async addToAuthenticatedUserFavorites() {
    const {authenticator} = this.$layer;

    const authenticatedUser = await authenticator.loadUser();
    await authenticatedUser.favorite(this);
    this.isFavoritedByAuthenticatedUser = true;
  }

  @expose({call: 'user'}) async removeFromAuthenticatedUserFavorites() {
    const {authenticator} = this.$layer;

    const authenticatedUser = await authenticator.loadUser();
    await authenticatedUser.unfavorite(this);
    this.isFavoritedByAuthenticatedUser = false;
  }

  @expose({call: 'author'}) static $delete;

  @expose({call: 'any'}) static $find;

  generateSlug() {
    this.slug = slugify(this.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
