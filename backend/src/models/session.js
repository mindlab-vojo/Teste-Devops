import {expose} from '@liaison/liaison';
import {Session as BaseSession} from '@liaison/react-liaison-realworld-example-app-shared';
import ow from 'ow';

const TOKEN_DURATION = 31536000000; // 1 year

export class Session extends BaseSession {
  @expose({get: true, set: true}) token;

  @expose({call: true}) async loadUserFromToken({fields} = {}) {
    const {User} = this.$layer;

    let user;

    const id = this.getUserIdFromToken();

    if (id !== undefined) {
      user = await User.$get({id}, {fields, throwIfNotFound: false});
    }

    if (!user) {
      // The token is invalid or the user doesn't exist anymore
      this.token = undefined;
    }

    return user;
  }

  getUserIdFromToken() {
    let id;

    if (this.token !== undefined) {
      const payload = this.$layer.jwt.verify(this.token);
      id = payload?.sub;
    }

    return id;
  }

  setTokenForUserId(userId, {expiresIn = TOKEN_DURATION} = {}) {
    ow(userId, ow.string.nonEmpty);
    ow(expiresIn, ow.number);

    const {jwt} = this.$layer;
    this.token = jwt.generate({
      sub: userId,
      exp: Math.round((Date.now() + expiresIn) / 1000)
    });
  }
}
