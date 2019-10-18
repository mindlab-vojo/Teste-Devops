import {field, validators, expose} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import ow from 'ow';
import bcrypt from 'bcrypt';

import {Entity} from './entity';

const {minLength} = validators;

const BCRYPT_SALT_ROUNDS = 5;

export class User extends BaseUser(Entity) {
  @expose({get: 'self', set: 'self'})
  @field({
    async beforeSave(email) {
      const {User} = this.$layer.fork().detach();
      if (await User.$has({email}, {exclude: this})) {
        throw new Error('Email already registered');
      }
    }
  })
  email;

  @expose({get: 'any', set: 'self'})
  @field({
    async beforeSave(username) {
      const {User} = this.$layer.fork().detach();
      if (await User.$has({username}, {exclude: this})) {
        throw new Error('Username already taken');
      }
    }
  })
  username;

  @expose({set: 'self'})
  @field('string', {
    validators: [minLength(50)],
    async saver(password) {
      return await this.constructor.hashPassword(password);
    }
  })
  password;

  @expose({get: 'any', set: 'self'}) bio;

  @expose({get: 'any', set: 'self'}) imageURL;

  @field('Article[]') favoritedArticles = [];

  @field('User[]') followedUsers = [];

  @expose({get: 'any'})
  @field({
    async loader() {
      const {session} = this.$layer;
      return session.user && (await this.isFollowedBy(session.user));
    }
  })
  isFollowedBySessionUser;

  async $exposedPropertyOperationIsAllowed({property, operation, setting}) {
    const isAllowed = await super.$exposedPropertyOperationIsAllowed({
      property,
      operation,
      setting
    });

    if (isAllowed !== undefined) {
      return isAllowed;
    }

    const thisIsSessionUser = this === this.$layer.session.user;

    if (!thisIsSessionUser) {
      return setting.has('other');
    }

    if (setting.has('self')) {
      return true;
    }
  }

  @expose({call: 'any'}) static $getId;

  @expose({call: 'any'}) static $load;

  @expose({call: 'guest'}) static async register({email, username, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(username, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const user = new this({email, username, password});
    await user.$save();

    this._login(user);

    return user;
  }

  @expose({call: 'guest'}) static async login({email, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const user = await this.$get({email}, {fields: {password: true}});

    if (!(await user.verifyPassword(password))) {
      throw new Error('Wrong password');
    }

    this._login(user);

    return user;
  }

  static _login(user) {
    const {session} = this.$layer;

    session.setTokenForUserId(user.id);
    session.user = user;
  }

  @expose({call: 'user'}) static $save; // TODO: Set expose to 'self'

  async favorite(article) {
    await this.$load({fields: {favoritedArticles: {}}});

    if (!this.favoritedArticles.includes(article)) {
      this.favoritedArticles.push(article);
      this.favoritedArticles = this.favoritedArticles; // TODO: Get rid of this
      await this.$save();
      await article.$load({fields: {favoritesCount: true}});
      article.favoritesCount++; // TODO: Implement article.updateFavoritesCount()
      await article.$save();
    }
  }

  async unfavorite(article) {
    await this.$load({fields: {favoritedArticles: {}}});

    const index = this.favoritedArticles.indexOf(article);
    if (index !== -1) {
      this.favoritedArticles.splice(index, 1);
      this.favoritedArticles = this.favoritedArticles; // TODO: Get rid of this
      await this.$save();
      await article.$load({fields: {favoritesCount: true}});
      article.favoritesCount--; // TODO: Implement article.updateFavoritesCount()
      await article.$save();
    }
  }

  async follow(user) {
    await this.$load({fields: {followedUsers: {}}});

    if (!this.followedUsers.includes(user)) {
      this.followedUsers.push(user);
      this.followedUsers = this.followedUsers; // TODO: Get rid of this
      await this.$save();
    }
  }

  async unfollow(user) {
    await this.$load({fields: {followedUsers: {}}});

    const index = this.followedUsers.indexOf(user);
    if (index !== -1) {
      this.followedUsers.splice(index, 1);
      this.followedUsers = this.followedUsers; // TODO: Get rid of this
      await this.$save();
    }
  }

  async isFollowedBy(user) {
    await user.$load({fields: {followedUsers: {}}});
    return user.followedUsers.includes(this);
  }

  @expose({call: 'other'}) async addToSessionUserFollowers() {
    const {session} = this.$layer;
    await session.user.follow(this);
    this.isFollowedBySessionUser = true;
  }

  @expose({call: 'other'}) async removeFromSessionUserFollowers() {
    const {session} = this.$layer;
    await session.user.unfollow(this);
    this.isFollowedBySessionUser = false;
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}
