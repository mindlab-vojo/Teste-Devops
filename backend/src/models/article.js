import {field, method} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Article extends BaseArticle(WithAuthor(Entity)) {
  @field({expose: {get: 'anyone', set: ['creator', 'author']}}) title;

  @field({expose: {get: 'anyone', set: ['creator', 'author']}}) description;

  @field({expose: {get: 'anyone', set: ['creator', 'author']}}) body;

  @field({expose: {get: 'anyone', set: ['creator', 'author']}}) tags;

  @field({expose: {get: 'anyone'}}) slug;

  @field({expose: {get: 'anyone'}}) favoritesCount = 0;

  @field({
    expose: {get: 'anyone'},

    async loader() {
      const {session} = this.$layer;
      return session.user && (await this.isFavoritedBy(session.user));
    }
  })
  isFavoritedBySessionUser;

  @method({expose: {call: 'anyone'}}) static $get;

  @method({expose: {call: 'anyone'}}) $load;

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

  @method({expose: {call: ['creator', 'author']}}) $save;

  async $beforeSave() {
    await super.$beforeSave();

    if (this.$isNew()) {
      this.generateSlug();
    }
  }

  generateSlug() {
    this.slug =
      slugify(this.title, {remove: /[^\w\s-]/g}) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  @method({expose: {call: 'author'}}) $delete;

  async $beforeDelete() {
    const {User, Comment} = this.$layer;

    // Remove references in users' favorited articles
    const users = await User.$find({favoritedArticles: this}, {fields: {favoritedArticles: {}}});
    for (const user of users) {
      user.favoritedArticles = user.favoritedArticles.filter(article => article !== this);
    }
    await User.$saveMany(users);

    // Remove related comments
    const comments = await Comment.$find({article: this}, {fields: {}});
    await Comment.$deleteMany(comments);
  }

  @method({expose: {call: 'anyone'}}) static $find;

  @method({expose: {call: 'anyone'}}) static $count;

  @method({expose: {call: 'anyone'}}) static async findPopularTags() {
    const {store} = this.$layer;

    // TODO: Don't use store's internals
    const collection = await store._getCollection('Article');
    const popularTags = await collection.distinct('tags');

    return popularTags;
  }
}
