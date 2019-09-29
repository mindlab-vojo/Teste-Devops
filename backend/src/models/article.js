import {Storable, store, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

export class Article extends Storable(BaseArticle, {storeName: 'store'}) {
  @expose({read: 'any', write: 'author'}) @store() title;

  @expose({read: 'any', write: 'author'}) @store() description;

  @expose({read: 'any', write: 'author'}) @store() body;

  @expose({read: 'any'}) @store() slug;

  @expose({read: 'any'}) @store() author;

  @expose({read: 'any'}) @store() createdAt;

  @expose({read: 'any'}) @store() updatedAt;

  @expose({read: 'any'}) @store() favoritesCount;

  @expose({read: 'user'}) isFavoritedByAuthenticatedUser;

  @expose() static $load;

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

  @expose({call: 'author'}) static $save;

  async $beforeSave() {
    const {authenticator} = this.$layer;

    await super.$beforeSave();

    if (this.$isNew()) {
      this.author = await authenticator.loadUser();
      this.generateSlug();
      this.createdAt = new Date();
    } else {
      this.updatedAt = new Date();
    }
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

  @expose({call: 'author'}) static $delete;

  @expose({call: 'any'}) static $find;

  generateSlug() {
    this.slug = slugify(this.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
