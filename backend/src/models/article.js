import {store, field, method, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Article extends BaseArticle(WithAuthor(Entity)) {
  @expose({read: 'any', write: 'author'}) @store() title;

  @expose({read: 'any', write: 'author'}) @store() description;

  @expose({read: 'any', write: 'author'}) @store() body;

  @expose({read: 'any', write: 'author'}) @store() tags;

  @expose({read: 'any'}) @store() slug;

  @expose({read: 'any'}) @store() favoritesCount;

  @expose({read: 'user'})
  @field({
    async finder(value) {
      // TODO: Remove this unused finder

      const {session} = this.$layer;

      if (value !== true) {
        throw new Error('$find() filter is unsupported');
      }

      const authenticatedUser = await session.loadUser({fields: {favoritedArticles: {}}});

      return authenticatedUser.favoritedArticles;
    }
  })
  isFavoritedByAuthenticatedUser;

  @expose({call: 'any'}) static $getId;

  @expose({call: 'any'}) static $load;

  async $afterLoad({fields}) {
    const {session} = this.$layer;

    await super.$afterLoad({fields});

    if (fields.has('isFavoritedByAuthenticatedUser')) {
      const authenticatedUser = await session.loadUser({fields: {favoritedArticles: {}}});

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
    await super.$beforeSave();

    if (this.$isNew()) {
      this.generateSlug();
    }
  }

  @expose({call: 'user'}) async addToAuthenticatedUserFavorites() {
    const {session} = this.$layer;

    const authenticatedUser = await session.loadUser();
    await authenticatedUser.favorite(this);
    this.isFavoritedByAuthenticatedUser = true;
  }

  @expose({call: 'user'}) async removeFromAuthenticatedUserFavorites() {
    const {session} = this.$layer;

    const authenticatedUser = await session.loadUser();
    await authenticatedUser.unfavorite(this);
    this.isFavoritedByAuthenticatedUser = false;
  }

  @expose({call: 'author'}) static $delete;

  @expose({call: 'any'}) static $find;

  @expose({call: 'any'}) static async findPopularTags() {
    const {store} = this.$layer;

    // TODO: Don't use store's internal
    const collection = await store._getCollection('Article');
    const popularTags = await collection.distinct('tags');

    return popularTags;
  }

  generateSlug() {
    this.slug = slugify(this.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
