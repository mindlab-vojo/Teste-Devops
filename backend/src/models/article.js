import {Storable, expose} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import slugify from 'slugify';

@expose()
export class Article extends Storable(BaseArticle) {
  @expose() title;

  @expose() description;

  @expose() body;

  @expose() slug;

  @expose() author;

  @expose() static async getBySlug(slug) {
    const article = (await this.find({filter: {slug}}))[0];

    if (!article) {
      throw new Error(`Article not found (slug: '${slug}')`);
    }

    return article;
  }

  @expose() save;

  async beforeSave() {
    const {authenticator} = this.layer;

    await super.beforeSave();

    const authenticatedUser = await authenticator.loadUser({fields: false});

    if (this.author !== authenticatedUser) {
      throw new Error('Authorization denied');
    }

    if (this.isNew()) {
      this.generateSlug();
    }
  }

  @expose() update;

  generateSlug() {
    this.slug = slugify(this.title) + '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  @expose() delete;

  async beforeDelete() {
    const {authenticator} = this.layer;

    await super.beforeDelete();

    const authenticatedUser = await authenticator.loadUser({fields: false});

    if (this.author !== authenticatedUser) {
      throw new Error('Authorization denied');
    }
  }
}
