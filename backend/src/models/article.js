import {Storable, storable, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

@expose()
export class Article extends Storable(BaseArticle) {
  @expose() @storable() title;

  @expose() @storable() description;

  @expose() @storable() body;

  @expose() @storable() slug;

  @expose() @storable() author;

  @expose() @storable() createdAt;

  @expose() @storable() updatedAt;

  @expose() @storable() favoritesCount;

  @expose() isFavoritedByAuthenticatedUser;

  @expose() static async getBySlug(slug) {
    const article = (await this.$find({filter: {slug}}))[0];

    if (!article) {
      throw new Error(`Article not found (slug: '${slug}')`);
    }

    return article;
  }

  async $afterLoad({fields}) {
    const {authenticator} = this.layer;

    await super.$afterLoad({fields});

    if (fields.has('isFavoritedByAuthenticatedUser')) {
      const authenticatedUser = await authenticator.loadUser({fields: {favoritedArticles: true}});

      this.isFavoritedByAuthenticatedUser =
        authenticatedUser && authenticatedUser.favoritedArticles.includes(this);
    }
  }

  @expose() async save() {
    const {authenticator} = this.layer;

    if (!this.isNew()) {
      throw new Error(`save() called on an existing article`); // TODO: Get rid of this
    }

    const authenticatedUser = await authenticator.loadUser({fields: false});

    if (this.author !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    this.generateSlug();
    this.createdAt = new Date();

    await this.$save();
  }

  @expose() async update(changes) {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser({fields: false});

    await this.$load({fields: {author: true}});

    if (this.author !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    this.assign(changes);
    this.updatedAt = new Date();

    await this.$save();
  }

  @expose() async addToAuthenticatedUserFavorites() {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser();

    if (!authenticatedUser) {
      throw new Error('Authorization denied');
    }

    await authenticatedUser.favorite(this);
    this.isFavoritedByAuthenticatedUser = true;
  }

  @expose() async removeFromAuthenticatedUserFavorites() {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser();

    if (!authenticatedUser) {
      throw new Error('Authorization denied');
    }

    await authenticatedUser.unfavorite(this);
    this.isFavoritedByAuthenticatedUser = false;
  }

  @expose() async delete() {
    const {authenticator} = this.layer;

    const authenticatedUser = await authenticator.loadUser({fields: false});

    await this.$load({fields: {author: true}});

    if (this.author !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    // TODO: Delete possible references in users favoritedArticles

    await this.$delete();
  }

  @expose() static async find(options) {
    const articles = await this.$find(options);
    return articles;
  }

  generateSlug() {
    this.slug = slugify(this.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
