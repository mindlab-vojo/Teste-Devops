import {Storable, field, expose} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import ow from 'ow';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 5;

@expose()
export class User extends Storable(BaseUser) {
  @expose() email;

  @expose() username;

  @field('string') passwordHash;

  @expose() bio;

  @expose() imageURL;

  static async getByEmail(email, {throwIfNotFound = true} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(throwIfNotFound, ow.boolean);

    const user = (await this.find({filter: {email}}))[0];

    if (!user) {
      if (throwIfNotFound) {
        throw new Error(`User not found (email: '${email}')`);
      }
      return undefined;
    }

    return user;
  }

  static async getByUsername(username, {throwIfNotFound = true} = {}) {
    ow(username, ow.string.nonEmpty);
    ow(throwIfNotFound, ow.boolean);

    const user = (await this.find({filter: {username}}))[0];

    if (!user) {
      if (throwIfNotFound) {
        throw new Error(`User not found (username: '${username}')`);
      }
      return undefined;
    }

    return user;
  }

  @expose() static async getProfile(username, {throwIfNotFound = true} = {}) {
    ow(username, ow.string.nonEmpty);
    ow(throwIfNotFound, ow.boolean);

    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser({fields: {followedUsers: true}});

    const user = (await this.find({filter: {username}}))[0];

    if (!user) {
      if (throwIfNotFound) {
        throw new Error(`User not found (username: '${username}')`);
      }
      return undefined;
    }

    const isFollowed = authenticatedUser && authenticatedUser.followedUsers.includes(user);

    return {user, isFollowed};
  }

  @expose() static async register({email, username, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(username, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {authenticator} = this.layer;

    if (await this.getByEmail(email, {throwIfNotFound: false})) {
      throw new Error('Email already registered');
    }

    if (await this.getByUsername(username, {throwIfNotFound: false})) {
      throw new Error('Username already taken');
    }

    const user = new this({email, username, password});
    await user.save();

    authenticator.setTokenForUserId(user.id);
    authenticator.user = user;

    return user;
  }

  @expose() static async login({email, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {authenticator} = this.layer;

    const user = await this.getByEmail(email, {throwIfNotFound: false});
    if (!user) {
      throw new Error('Email not registered');
    }

    if (!(await user.verifyPassword(password))) {
      throw new Error('Wrong password');
    }

    authenticator.setTokenForUserId(user.id);
    authenticator.user = user;

    return user;
  }

  async beforeSave() {
    await super.beforeSave();

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

    return await super.update(changes, options);
  }

  @expose() async follow(user) {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser({fields: {followedUsers: true}});

    if (this !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    if (!this.followedUsers.includes(user)) {
      this.followedUsers.push(user);
      this.followedUsers = this.followedUsers; // TODO: Get rid of this
      await this.save();
    }
  }

  @expose() async unfollow(user) {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser({fields: {followedUsers: true}});
    if (this !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    const index = this.followedUsers.indexOf(user);
    if (index !== -1) {
      this.followedUsers.splice(index, 1);
      this.followedUsers = this.followedUsers; // TODO: Get rid of this
      await this.save();
    }
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}
