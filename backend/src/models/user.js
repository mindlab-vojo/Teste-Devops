import {field, method, role} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import bcrypt from 'bcryptjs';

import {Entity} from './entity';

const BCRYPT_SALT_ROUNDS = 5;

export class User extends BaseUser(Entity) {
  @field({
    expose: {get: 'self', set: ['creator', 'self']},

    async beforeSave(email) {
      const {User} = this.$layer.$fork().$detach();
      if (await User.$has({email}, {exclude: this})) {
        throw Object.assign(new Error('Email already registered'), {
          displayMessage: 'This email address is already registered.'
        });
      }
    }
  })
  email;

  @field({
    expose: {get: 'anyone', set: ['creator', 'self']},

    async beforeSave(username) {
      const {User} = this.$layer.$fork().$detach();
      if (await User.$has({username}, {exclude: this})) {
        throw Object.assign(new Error('Username already taken'), {
          displayMessage: 'This username is already taken.'
        });
      }
    }
  })
  username;

  @field('string', {
    expose: {set: ['creator', 'self']},

    async saver(password) {
      return await this.constructor.hashPassword(password);
    }
  })
  password;

  @field({expose: {get: 'anyone', set: ['creator', 'self']}}) bio;

  @field({expose: {get: 'anyone', set: ['creator', 'self']}}) imageURL;

  @field('Article[]') favoritedArticles = [];

  @field('User[]') followedUsers = [];

  @field({
    expose: {get: 'anyone'},

    async loader() {
      const {session} = this.$layer;
      return session.user && (await this.isFollowedBy(session.user));
    }
  })
  isFollowedBySessionUser;

  @role('self') selfRoleResolver() {
    if (this.$resolveRole('creator') || this.$resolveRole('guest')) {
      return undefined;
    }

    return this === this.$layer.session.user;
  }

  @method({expose: {call: 'anyone'}}) static $get;

  @method({expose: {call: 'anyone'}}) $load;

  @method({expose: {call: 'self'}}) $save;

  @method({expose: {call: 'creator'}}) async signUp() {
    await this.$save();

    this.$layer.session.setTokenForUserId(this.id);
  }

  @method({expose: {call: 'creator'}}) async signIn() {
    this.$validate({fields: {email: true, password: true}});

    const {User} = this.$layer.$fork().$detach();

    const existingUser = await User.$get(
      {email: this.email},
      {fields: {password: true}, throwIfNotFound: false}
    );

    if (!existingUser) {
      throw Object.assign(new Error('User not found'), {
        displayMessage: 'There is no user registered with that email address.'
      });
    }

    if (!(await this.verifyPassword(existingUser))) {
      throw Object.assign(new Error('Wrong password'), {
        displayMessage: 'The password you entered is incorrect.'
      });
    }

    this.$layer.session.setTokenForUserId(existingUser.id);
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
