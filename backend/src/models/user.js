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

  async beforeSave() {
    await super.beforeSave();

    if (this.getField('password').getOptionalValue() !== undefined) {
      this.passwordHash = await this.constructor.hashPassword(this.password);
      this.password = undefined;
    }
  }

  @expose() async update(...args) {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.getUser({fields: false});

    if (this !== authenticatedUser) {
      throw new Error('Authorization failed');
    }

    return await super.update(...args);
  }

  static async register({email, username, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(username, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    if (await this.getByEmail(email)) {
      throw new Error('Email already registered');
    }

    if (await this.getByUsername(username)) {
      throw new Error('Username already taken');
    }

    const user = new this({email, username, password});
    await user.save();

    return user;
  }

  static async login({email, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const user = await this.getByEmail(email);
    if (!user) {
      throw new Error('Email not registered');
    }

    if (!(await user.verifyPassword(password))) {
      throw new Error('Wrong password');
    }

    return user;
  }

  static async getByEmail(email) {
    return (await this.find({filter: {email}}))[0];
  }

  static async getByUsername(username) {
    return (await this.find({filter: {username}}))[0];
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}
