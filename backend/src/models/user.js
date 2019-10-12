import {field, expose} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import ow from 'ow';
import bcrypt from 'bcrypt';

import {Entity} from './entity';

const BCRYPT_SALT_ROUNDS = 5;

export class User extends BaseUser(Entity) {
  @expose({read: 'self', write: 'self'}) email;

  @expose({read: 'any', write: 'self'}) username;

  @field('string') passwordHash;

  @expose({read: 'any', write: 'self'}) bio;

  @expose({read: 'any', write: 'self'}) imageURL;

  @field('Article[]') favoritedArticles = [];

  @field('User[]') followedUsers = [];

  @expose({read: 'other'})
  @field({
    async loader() {
      const {session} = this.$layer;
      const authenticatedUser = await session.loadUser({fields: {followedUsers: {}}});
      return authenticatedUser && authenticatedUser.followedUsers.includes(this);
    }
  })
  isFollowedByAuthenticatedUser;

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

    const user = await this.$get({email});

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

  @expose({call: 'self'}) static $save;

  async $beforeSave() {
    const {User} = this.$layer;

    await super.$beforeSave();

    const email = this.$getField('email').getValue({throwIfInactive: false});
    if (email !== undefined) {
      if (await User.$has({email}, {exclude: this})) {
        throw new Error('Email already registered');
      }
    }

    const username = this.$getField('username').getValue({throwIfInactive: false});
    if (username !== undefined) {
      if (await User.$has({username}, {exclude: this})) {
        throw new Error('Username already taken');
      }
    }

    if (this.$getField('password').getValue({throwIfInactive: false}) !== undefined) {
      this.passwordHash = await this.constructor.hashPassword(this.password);
      this.password = undefined;
    }
  }

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

  @expose({call: 'other'}) async addToAuthenticatedUserFollowers() {
    const {session} = this.$layer;

    const authenticatedUser = await session.loadUser({fields: {}});
    await authenticatedUser.follow(this);
    this.isFollowedByAuthenticatedUser = true;
  }

  @expose({call: 'other'}) async removeFromAuthenticatedUserFollowers() {
    const {session} = this.$layer;

    const authenticatedUser = await session.loadUser({fields: {}});
    await authenticatedUser.unfollow(this);
    this.isFollowedByAuthenticatedUser = false;
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}
