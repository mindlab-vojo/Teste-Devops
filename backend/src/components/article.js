import {consume, expose, validators} from '@liaison/component';
import {secondaryIdentifier, attribute, method, loader, finder} from '@liaison/storable';
import slugify from 'slugify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

const {notEmpty, maxLength, rangeLength, match} = validators;

@expose({
  get: {call: 'anyone'},
  find: {call: 'anyone'},
  count: {call: 'anyone'},
  prototype: {
    load: {call: 'anyone'},
    save: {call: 'author'},
    delete: {call: 'author'}
  }
})
export class Article extends WithAuthor(Entity) {
  @consume() static User;
  @consume() static Comment;

  @expose({get: 'anyone', set: 'author'})
  @attribute('string', {validators: [notEmpty(), maxLength(200)]})
  title = '';

  @expose({get: 'anyone'})
  @secondaryIdentifier('string', {validators: [rangeLength([8, 300])]})
  slug = this.generateSlug();

  @expose({get: 'anyone', set: 'author'})
  @attribute('string', {validators: [rangeLength([1, 500])]})
  description = '';

  @expose({get: 'anyone', set: 'author'})
  @attribute('string', {validators: [rangeLength([1, 50000])]})
  body = '';

  @expose({get: 'anyone', set: 'author'})
  @attribute('string[]', {
    validators: [rangeLength([0, 10])],
    items: {validators: [rangeLength([1, 30]), match(/^[a-z0-9-]+$/)]}
  })
  tags = [];

  @expose({get: 'anyone'}) @attribute('number') favoritesCount = 0;

  @expose({get: 'anyone'})
  @loader(async function () {
    const {user} = this.constructor.Session;

    return user && (await this.isFavoritedBy(user));
  })
  @attribute('boolean?')
  isFavoritedBySessionUser;

  @finder(async function (user) {
    await user.load({favoritedArticles: {}});

    return {$in: user.favoritedArticles};
  })
  @method()
  async isFavoritedBy(user) {
    await user.load({favoritedArticles: {}});

    return user.favoritedArticles.includes(this);
  }

  generateSlug() {
    this.validate({title: true});

    return (
      slugify(this.title, {remove: /[^\w\s-]/g}) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

  async beforeDelete() {
    const {User, Comment} = this.constructor;

    // Remove references in users' favorited articles

    const users = await User.find({favoritedArticles: this}, {favoritedArticles: {}});

    await Promise.all(
      users.map((user) => {
        user.favoritedArticles = user.favoritedArticles.filter((article) => article !== this);

        return user.save();
      })
    );

    // Remove related comments

    const comments = await Comment.find({article: this}, {});

    await Promise.all(comments.map((comment) => comment.delete()));
  }

  @expose({call: 'anyone'}) @method() static async findPopularTags() {
    // TODO: Don't use store's internals
    const store = this.getStore();
    const collection = await store._getCollection('Article');
    const popularTags = await collection.distinct('tags');

    return popularTags;
  }
}
