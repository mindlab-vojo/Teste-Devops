import {Storable, storable, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

@expose() // TODO: Remove this useless decorator
export class Article extends Storable(BaseArticle) {
  @expose({read: 'any', write: 'author'}) @storable() title;

  @expose({read: 'any', write: 'author'}) @storable() description;

  @expose({read: 'any', write: 'author'}) @storable() body;

  @expose({read: 'any'}) @storable() slug;

  @expose({read: 'any'}) @storable() author;

  @expose({read: 'any'}) @storable() createdAt;

  @expose({read: 'any'}) @storable() updatedAt;

  @expose({read: 'any'}) @storable() favoritesCount;

  @expose({read: 'user'}) isFavoritedByAuthenticatedUser;

  @expose({call: 'any'}) static async getBySlug(slug) {
    const article = (await this.$find({filter: {slug}}))[0];

    if (!article) {
      throw new Error(`Article not found (slug: '${slug}')`);
    }

    return article;
  }

  async $afterLoad({fields}) {
    const {authenticator} = this.$layer;

    await super.$afterLoad({fields});

    if (fields.has('isFavoritedByAuthenticatedUser')) {
      const authenticatedUser = await authenticator.loadUser({fields: {favoritedArticles: true}});

      this.isFavoritedByAuthenticatedUser =
        authenticatedUser && authenticatedUser.favoritedArticles.includes(this);
    }
  }

  @expose({call: 'author'}) async save() {
    if (!this.$isNew()) {
      throw new Error(`save() called on an existing article`); // TODO: Get rid of this
    }

    this.generateSlug();
    this.createdAt = new Date();

    await this.$save();
  }

  @expose({call: 'author'}) async update(changes) {
    this.$assign(changes);
    this.updatedAt = new Date();

    await this.$save();
  }

  @expose({call: 'user'}) async addToAuthenticatedUserFavorites() {
    const {authenticator} = this.$layer;

    const authenticatedUser = await authenticator.loadUser();
    await authenticatedUser.favorite(this);
    this.isFavoritedByAuthenticatedUser = true;
  }

  @expose({call: 'user'}) async removeFromAuthenticatedUserFavorites() {
    const {authenticator} = this.$layer;

    const authenticatedUser = await authenticator.loadUser();
    await authenticatedUser.unfavorite(this);
    this.isFavoritedByAuthenticatedUser = false;
  }

  @expose({call: 'author'}) async delete() {
    // TODO: Delete possible references in users favoritedArticles

    await this.$delete();
  }

  @expose({call: 'any'}) static async find(options) {
    return await this.$find(options);
  }

  generateSlug() {
    this.slug = slugify(this.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
