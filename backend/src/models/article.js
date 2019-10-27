import {field, method} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Article extends BaseArticle(WithAuthor(Entity)) {
  @field({expose: {get: 'any', set: ['new', 'author']}}) title;

  @field({expose: {get: 'any', set: ['new', 'author']}}) description;

  @field({expose: {get: 'any', set: ['new', 'author']}}) body;

  @field({expose: {get: 'any', set: ['new', 'author']}}) tags;

  @field({expose: {get: 'any'}}) slug;

  @field({expose: {get: 'any'}}) favoritesCount = 0;

  @field({
    expose: {get: 'any'},
    async loader() {
      const {session} = this.$layer;
      return session.user && (await this.isFavoritedBy(session.user));
    }
  })
  isFavoritedBySessionUser;

  @method({expose: {call: 'any'}}) static $get;

  @method({expose: {call: 'any'}}) $load;

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

  @method({expose: {call: ['new', 'author']}}) $save;

  async $beforeSave() {
    await super.$beforeSave();

    if (this.$isNew()) {
      this.generateSlug();
    }
  }

  @method({expose: {call: 'author'}}) $delete;

  async $beforeDelete() {
    const {User, Comment} = this.$layer;

    // Remove related comments
    const comments = await Comment.$find({filter: {article: this}, fields: {}});
    await Comment.$deleteMany(comments);

    // Remove references in users' favorited articles
    const users = await User.$find({
      filter: {favoritedArticles: this},
      fields: {favoritedArticles: {}}
    });
    for (const user of users) {
      user.favoritedArticles = user.favoritedArticles.filter(article => article !== this);
    }
    await User.$saveMany(users);
  }

  @method({expose: {call: 'any'}}) static $find;

  @method({expose: {call: 'any'}}) static async findPopularTags() {
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
