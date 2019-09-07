import {expose} from '@liaison/liaison';
import {Authenticator as BaseAuthenticator} from '@liaison/react-liaison-realworld-example-app-shared';
import ow from 'ow';

const TOKEN_DURATION = 31536000000; // 1 year

@expose()
export class Authenticator extends BaseAuthenticator {
  @expose() async register({email, username, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(username, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {User} = this.layer;

    const user = await User.register({email, username, password});

    if (user) {
      this.token = this.constructor.generateToken(user.id);
    } else {
      this.token = undefined;
    }

    return user;
  }

  @expose() async login({email, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {User} = this.layer;

    const user = await User.login({email, password});

    if (user) {
      this.token = this.constructor.generateToken(user.id);
    } else {
      this.token = undefined;
    }

    return user;
  }

  @expose() async getUser() {
    const {User} = this.layer;

    if (this.token === undefined) {
      return undefined;
    }

    const id = this.constructor.verifyToken(this.token);

    if (id === undefined) {
      this.token = undefined;
      return undefined;
    }

    const user = await User.get(id, {throwIfNotFound: false});

    if (!user) {
      this.token = undefined;
    }

    return user;
  }

  static generateToken(id, {expiresIn = TOKEN_DURATION} = {}) {
    ow(expiresIn, ow.number);

    const {jwt} = this.layer;

    const token = jwt.generate({
      sub: id,
      exp: Math.round((Date.now() + expiresIn) / 1000)
    });

    return token;
  }

  static verifyToken(token) {
    ow(token, ow.string.nonEmpty);

    const {jwt} = this.layer;

    const payload = jwt.verify(token);

    const id = payload?.sub;

    return id;
  }
}
