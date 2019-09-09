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

    if (!user) {
      // User registration failed
      return undefined;
    }

    this.setTokenForUserId(user.id);

    return user;
  }

  @expose() async login({email, password} = {}) {
    ow(email, ow.string.nonEmpty);
    ow(password, ow.string.nonEmpty);

    const {User} = this.layer;

    const user = await User.login({email, password});

    if (!user) {
      // User authentication failed
      return undefined;
    }

    this.setTokenForUserId(user.id);

    return user;
  }

  @expose() async getUser({fields} = {}) {
    const {User} = this.layer;

    if (!this.hasToken()) {
      return undefined;
    }

    const id = this.getUserIdFromToken();

    if (id === undefined) {
      // The token is invalid or expired
      this.clearToken();
      return undefined;
    }

    const user = await User.get(id, {fields, throwIfNotFound: false});

    if (!user) {
      // The user doesn't exist anymore
      this.clearToken();
      return undefined;
    }

    return user;
  }

  getUserIdFromToken() {
    ow(this.token, ow.string.nonEmpty);

    const {jwt} = this.layer;

    const payload = jwt.verify(this.token);

    const id = payload?.sub;

    return id;
  }

  setTokenForUserId(userId, {expiresIn = TOKEN_DURATION} = {}) {
    ow(userId, ow.string.nonEmpty);
    ow(expiresIn, ow.number);

    const {jwt} = this.layer;

    this.token = jwt.generate({
      sub: userId,
      exp: Math.round((Date.now() + expiresIn) / 1000)
    });
  }
}
