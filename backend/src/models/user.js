import {Storable, storable, field, expose} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import ow from 'ow';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 5;

@expose()
export class User extends Storable(BaseUser) {
  @expose() @storable() email;

  @expose() @storable() username;

  @storable() @field('string') passwordHash;

  @expose() @storable() bio;

  @expose() @storable() imageURL;

  @storable() @field('Article[]') favoritedArticles = [];

  @storable() @field('User[]') followedUsers = [];

  @expose() isFollowedByAuthenticatedUser;

  static async getByEmail(email) {
    ow(email, ow.string.nonEmpty);

    const user = (await this.$find({filter: {email}}))[0];

    if (!user) {
      throw new Error(`User not found (email: '${email}')`);
    }

    return user;
  }

  static async hasEmail(email) {
    ow(email, ow.string.nonEmpty);

    return (await this.$find({filter: {email}})).length > 0;
  }

  @expose() static async getByUsername(username, {fields} = {}) {
    ow(username, ow.string.nonEmpty);

    const user = (await this.$find({filter: {username}, fields}))[0];

    if (!user) {
      throw new Error(`User not found (username: '${username}')`);
    }

    return user;
  }

  static async hasUsername(username) {
    ow(username, ow.string.nonEmpty);

    return (await this.$find({filter: {username}})).length > 0;
  }

  async $afterLoad({fields}) {
    const {authenticator} = this.layer;

    await super.$afterLoad({fields});

    if (fields.has('isFollowedByAuthenticatedUser')) {
      const authenticatedUser = await authenticator.loadUser({fields: {followedUsers: true}});

      this.isFollowedByAuthenticatedUser =
        authenticatedUser && authenticatedUser.followedUsers.includes(this);
    }
  }

  @expose() static async register({email, username, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(username, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {authenticator} = this.layer;

    if (await this.hasEmail(email)) {
      throw new Error('Email already registered');
    }

    if (await this.hasUsername(username)) {
      throw new Error('Username already taken');
    }

    const user = new this({email, username, password});
    await user.$save();

    authenticator.setTokenForUserId(user.id);
    authenticator.user = user;

    return user;
  }

  @expose() static async login({email, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {authenticator} = this.layer;

    const user = await this.getByEmail(email);

    if (!(await user.verifyPassword(password))) {
      throw new Error('Wrong password');
    }

    authenticator.setTokenForUserId(user.id);
    authenticator.user = user;

    return user;
  }

  async $beforeSave() {
    await super.$beforeSave();

    // TODO: Ensure email and username are not already taken

    if (this.getField('password').getValue({throwIfInactive: false}) !== undefined) {
      this.passwordHash = await this.constructor.hashPassword(this.password);
      this.password = undefined;
    }
  }

  @expose() async update(changes, options) {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser({fields: false});

    if (this !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    return await this.$update(changes, options);
  }

  async favorite(article) {
    await this.$load({fields: {favoritedArticles: true}});

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
    await this.$load({fields: {favoritedArticles: true}});

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
    await this.$load({fields: {followedUsers: true}});

    if (!this.followedUsers.includes(user)) {
      this.followedUsers.push(user);
      this.followedUsers = this.followedUsers; // TODO: Get rid of this
      await this.$save();
    }
  }

  async unfollow(user) {
    await this.$load({fields: {followedUsers: true}});

    const index = this.followedUsers.indexOf(user);
    if (index !== -1) {
      this.followedUsers.splice(index, 1);
      this.followedUsers = this.followedUsers; // TODO: Get rid of this
      await this.$save();
    }
  }

  @expose() async addToAuthenticatedUserFollowers() {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser();

    if (!authenticatedUser) {
      throw new Error('Authorization denied');
    }

    await authenticatedUser.follow(this);
    this.isFollowedByAuthenticatedUser = true;
  }

  @expose() async removeFromAuthenticatedUserFollowers() {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser();

    if (!authenticatedUser) {
      throw new Error('Authorization denied');
    }

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
