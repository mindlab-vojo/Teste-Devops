import {field, method} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import bcrypt from 'bcrypt';

import {Entity} from './entity';

const BCRYPT_SALT_ROUNDS = 5;

export class User extends BaseUser(Entity) {
  @field({
    expose: {get: 'self', set: ['new', 'self']},
    async beforeSave(email) {
      const {User} = this.$layer.fork().detach();
      if (await User.$has({email}, {exclude: this})) {
        throw Object.assign(new Error('Email already registered'), {
          displayMessage: 'This email address is already registered.'
        });
      }
    }
  })
  email;

  @field({
    expose: {get: 'any', set: ['new', 'self']},
    async beforeSave(username) {
      const {User} = this.$layer.fork().detach();
      if (await User.$has({username}, {exclude: this})) {
        throw Object.assign(new Error('Username already taken'), {
          displayMessage: 'This username is already taken.'
        });
      }
    }
  })
  username;

  @field('string', {
    expose: {set: ['new', 'self']},
    async saver(password) {
      return await this.constructor.hashPassword(password);
    }
  })
  password;

  @field({expose: {get: 'any', set: ['new', 'self']}}) bio;

  @field({expose: {get: 'any', set: ['new', 'self']}}) imageURL;

  @field('Article[]') favoritedArticles = [];

  @field('User[]') followedUsers = [];

  @field({
    expose: {get: 'any'},
    async loader() {
      const {session} = this.$layer;
      return session.user && (await this.isFollowedBy(session.user));
    }
  })
  isFollowedBySessionUser;

  async $resolvePropertyOperationSetting(setting) {
    const resolvedSetting = await super.$resolvePropertyOperationSetting(setting);

    if (resolvedSetting !== undefined) {
      return resolvedSetting;
    }

    if (this.$isNew()) {
      return;
    }

    const isSelf = this === this.$layer.session.user;

    if (!isSelf) {
      return setting.has('other');
    }

    if (setting.has('self')) {
      return true;
    }
  }

  @method({expose: {call: 'any'}}) static $get;

  @method({expose: {call: 'any'}}) $load;

  @method({expose: {call: 'self'}}) $save;

  @method({expose: {call: 'new'}}) async signUp() {
    const {session} = this.$layer;

    await this.$save();

    session.setTokenForUser(this);
  }

  @method({expose: {call: 'new'}}) async signIn() {
    const {session} = this.$layer;

    this.$validate({fields: {email: true, password: true}});

    const {User} = this.$layer.fork().detach();

    let existingUser;
    try {
      existingUser = await User.$get({email: this.email}, {fields: {password: true}});
    } catch (error) {
      throw Object.assign(new Error('User not found'), {
        displayMessage: 'There is no user registered with that email address.'
      });
    }

    if (!(await this.verifyPassword(existingUser))) {
      throw Object.assign(new Error('Wrong password'), {
        displayMessage: 'The password you entered is incorrect.'
      });
    }

    session.setTokenForUser(existingUser);
  }

  @method({expose: {call: 'self'}}) async favorite(article) {
    await this.$load({fields: {favoritedArticles: {}}});

    if (!this.favoritedArticles.includes(article)) {
      this.favoritedArticles = [...this.favoritedArticles, article];
      await this.$save();
      await article.$load({fields: {favoritesCount: true}});
      article.favoritesCount++;
      await article.$save();
      article.isFavoritedBySessionUser = true;
    }

    return article;
  }

  @method({expose: {call: 'self'}}) async unfavorite(article) {
    await this.$load({fields: {favoritedArticles: {}}});

    if (this.favoritedArticles.includes(article)) {
      this.favoritedArticles = this.favoritedArticles.filter(
        favoritedArticle => favoritedArticle !== article
      );
      await this.$save();
      await article.$load({fields: {favoritesCount: true}});
      article.favoritesCount--;
      await article.$save();
      article.isFavoritedBySessionUser = false;
    }

    return article;
  }

  @method({expose: {call: 'self'}}) async follow(user) {
    await this.$load({fields: {followedUsers: {}}});

    if (!this.followedUsers.includes(user)) {
      this.followedUsers = [...this.followedUsers, user];
      await this.$save();
      user.isFollowedBySessionUser = true;
    }

    return user;
  }

  @method({expose: {call: 'self'}}) async unfollow(user) {
    await this.$load({fields: {followedUsers: {}}});

    if (this.followedUsers.includes(user)) {
      this.followedUsers = this.followedUsers.filter(followedUser => followedUser !== user);
      await this.$save();
      user.isFollowedBySessionUser = false;
    }

    return user;
  }

  async isFollowedBy(user) {
    await user.$load({fields: {followedUsers: {}}});
    return user.followedUsers.includes(this);
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async verifyPassword(existingUser) {
    return await bcrypt.compare(this.password, existingUser.password);
  }
}
