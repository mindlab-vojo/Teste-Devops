import {field, method, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Article extends BaseArticle(WithAuthor(Entity)) {
  @expose({get: 'any', set: 'author'}) title;

  @expose({get: 'any', set: 'author'}) description;

  @expose({get: 'any', set: 'author'}) body;

  @expose({get: 'any', set: 'author'}) tags;

  @expose({get: 'any'}) slug;

  @expose({get: 'any'}) @field() favoritesCount = 0;

  @expose({get: 'any'})
  @field({
    async loader() {
      const {session} = this.$layer;
      return session.user && (await this.isFavoritedBy(session.user));
    }
  })
  isFavoritedBySessionUser;

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

  @expose({call: 'user'}) static $save; // TODO: Set expose to 'author'

  async $beforeSave() {
    await super.$beforeSave();

    if (this.$isNew()) {
      this.generateSlug();
    }
  }

  @expose({call: 'user'}) async addToSessionUserFavorites() {
    const {session} = this.$layer;
    await session.user.favorite(this);
    this.isFavoritedBySessionUser = true;
  }

  @expose({call: 'user'}) async removeFromSessionUserFavorites() {
    const {session} = this.$layer;
    await session.user.unfavorite(this);
    this.isFavoritedBySessionUser = false;
  }

  @expose({call: 'user'}) static $delete; // TODO: Set expose to 'author'

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
