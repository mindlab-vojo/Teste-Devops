import {field, expose} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import bcrypt from 'bcrypt';

import {Entity} from './entity';

const BCRYPT_SALT_ROUNDS = 5;

export class User extends BaseUser(Entity) {
  @expose({get: 'self', set: ['new', 'self']})
  @field({
    async beforeSave(email) {
      const {User} = this.$layer.fork().detach();
      if (await User.$has({email}, {exclude: this})) {
        throw new Error('Email already registered');
      }
    }
  })
  email;

  @expose({get: 'any', set: ['new', 'self']})
  @field({
    async beforeSave(username) {
      const {User} = this.$layer.fork().detach();
      if (await User.$has({username}, {exclude: this})) {
        throw new Error('Username already taken');
      }
    }
  })
  username;

  @expose({set: ['new', 'self']})
  @field('string', {
    async saver(password) {
      return await this.constructor.hashPassword(password);
    }
  })
  password;

  @expose({get: 'any', set: ['new', 'self']}) bio;

  @expose({get: 'any', set: ['new', 'self']}) imageURL;

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

  @expose({call: 'any'}) static $getId;

  @expose({call: 'any'}) $load;

  @expose({call: 'self'}) $save;

  @expose({call: 'new'}) async signUp() {
    const {session} = this.$layer;

    await this.$save();

    session.setTokenForUser(this);
  }

  @expose({call: 'new'}) async signIn() {
    const {session} = this.$layer;

    this.$validate({fields: {email: true, password: true}});

    const {User} = this.$layer.fork().detach();
    const existingUser = await User.$get({email: this.email}, {fields: {password: true}});

    if (!(await this.verifyPassword(existingUser))) {
      throw new Error('Wrong password');
    }

    session.setTokenForUser(existingUser);
  }

  @expose({call: 'self'}) async favorite(article) {
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

  @expose({call: 'self'}) async unfavorite(article) {
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

  @expose({call: 'self'}) async follow(user) {
    await this.$load({fields: {followedUsers: {}}});

    if (!this.followedUsers.includes(user)) {
      this.followedUsers = [...this.followedUsers, user];
      await this.$save();
      user.isFollowedBySessionUser = true;
    }

    return user;
  }

  @expose({call: 'self'}) async unfollow(user) {
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
