import {field, method, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Article extends BaseArticle(WithAuthor(Entity)) {
  @expose({read: 'any', write: 'author'}) title;

  @expose({read: 'any', write: 'author'}) description;

  @expose({read: 'any', write: 'author'}) body;

  @expose({read: 'any', write: 'author'}) tags;

  @expose({read: 'any'}) slug;

  @expose({read: 'any'}) favoritesCount;

  @expose({read: 'user'})
  @field({
    async loader() {
      const {session} = this.$layer;
      const authenticatedUser = await session.loadUser({fields: {favoritedArticles: {}}});
      return authenticatedUser && (await this.isFavoritedBy(authenticatedUser));
    }
  })
  isFavoritedByAuthenticatedUser;

  @expose({call: 'any'}) static $getId;

  @expose({call: 'any'}) static $load;

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

    const authenticatedUser = await session.loadUser({fields: {}});
    await authenticatedUser.favorite(this);
    this.isFavoritedByAuthenticatedUser = true;
  }

  @expose({call: 'user'}) async removeFromAuthenticatedUserFavorites() {
    const {session} = this.$layer;

    const authenticatedUser = await session.loadUser({fields: {}});
    await authenticatedUser.unfavorite(this);
    this.isFavoritedByAuthenticatedUser = false;
  }

  @expose({call: 'author'}) static $delete;

  async $beforeDelete() {
    const {Comment} = this.$layer;

    // TODO: Remove reference from user's favoritedArticles

    const comments = await Comment.$find({filter: {article: this}, fields: {}});
    await Comment.$delete(comments);
  }

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
