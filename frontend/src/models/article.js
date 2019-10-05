import React, {useMemo, useCallback} from 'react';
import {Routable, route} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import {view, useAsyncCallback} from '@liaison/react-integration';
import marked from 'marked';
import DOMPurify from 'dompurify';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Article extends Routable(BaseArticle(WithAuthor(Entity))) {
  @route('/article/:slug') @view() static Main({slug}) {
    return (
      <this.Loader
        query={{slug}}
        fields={{
          title: true,
          description: true,
          body: true,
          slug: true,
          author: {username: true, imageURL: true},
          createdAt: true
        }}
      >
        {article => <article.Main />}
      </this.Loader>
    );
  }

  @view() Main() {
    const {CommentList} = this.$layer;

    const bodyHTML = {__html: DOMPurify.sanitize(marked(this.body))};

    return (
      <div className="article-page">
        <div className="banner">
          <div className="container">
            <h1>{this.title}</h1>

            <this.Meta>
              <this.Actions />
            </this.Meta>
          </div>
        </div>

        <div className="container page">
          <div className="row article-content">
            <div className="col-xs-12">
              <div dangerouslySetInnerHTML={bodyHTML} />
            </div>
          </div>

          <hr />

          <div className="article-actions" />

          <div className="row">
            <CommentList.Main article={this} />
          </div>
        </div>
      </div>
    );
  }

  @view() Meta({children}) {
    const {User} = this.$layer;

    return (
      <div className="article-meta">
        <User.Main.Link params={this.author}>
          <this.author.ProfileImage />
        </User.Main.Link>

        <div className="info">
          <User.Main.Link params={this.author} className="author">
            {this.author.username}
          </User.Main.Link>
          <span className="date">{this.createdAt.toDateString()}</span>
        </div>

        {children}
      </div>
    );
  }

  @view() Actions() {
    const {Home, session} = this.$layer;

    const handleEdit = useCallback(() => {
      this.constructor.Editor.navigate(this);
    }, []);

    const [handleDelete, isDeleting, deletingError] = useAsyncCallback(async () => {
      await this.$delete();
      Home.Main.navigate();
    }, []);

    if (this.author !== session.user) {
      return null;
    }

    return (
      <span>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleEdit}
          disabled={isDeleting}
        >
          <i className="ion-edit" /> Edit article
        </button>

        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleDelete}
          disabled={isDeleting}
          style={{marginLeft: '.5rem'}}
        >
          <i className="ion-trash-a" /> Delete article
        </button>

        {deletingError && (
          <span style={{marginLeft: '.5rem'}}>
            Sorry, something went wrong while deleting the article.
          </span>
        )}
      </span>
    );
  }

  @route('/editor') @view() static Creator() {
    const {Home, session} = this.$layer;

    if (!session.user) {
      Home.Main.redirect();
      return null;
    }

    const article = useMemo(() => new this());

    return <article.Creator />;
  }

  @view() Creator() {
    const {Article} = this.$layer;

    const [handleSave, , savingError] = useAsyncCallback(async () => {
      await this.$save();
      Article.Main.navigate(this);
    }, []);

    return (
      <div>
        {savingError && <p>Sorry, something went wrong while saving your article.</p>}
        <this.Form onSubmit={handleSave} />
      </div>
    );
  }

  @route('/editor/:slug') @view() static Editor({slug}) {
    return (
      <this.Loader query={{slug}} fields={{title: true, description: true, body: true}}>
        {article => <article.Editor />}
      </this.Loader>
    );
  }

  @view() Editor() {
    const {Article} = this.$layer;

    const fork = useMemo(() => this.$fork(), []);

    const [handleSave, , savingError] = useAsyncCallback(async () => {
      await fork.$save();
      this.$merge(fork);
      Article.Main.navigate(this);
    }, [fork]);

    return (
      <div>
        {savingError && <p>Sorry, something went wrong while saving your article.</p>}
        <fork.Form onSubmit={handleSave} />
      </div>
    );
  }

  @view() Form({onSubmit}) {
    const [handleSubmit, isSubmitting] = useAsyncCallback(
      async event => {
        event.preventDefault();
        await onSubmit();
      },
      [onSubmit]
    );

    return (
      <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">
              <form onSubmit={handleSubmit} autoComplete="off">
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Article title"
                      value={this.title || ''}
                      onChange={event => {
                        this.title = event.target.value;
                      }}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="What's this article about?"
                      value={this.description || ''}
                      onChange={event => {
                        this.description = event.target.value;
                      }}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="8"
                      placeholder="Write your article (in markdown)"
                      value={this.body || ''}
                      onChange={event => {
                        this.body = event.target.value;
                      }}
                      required
                    />
                  </fieldset>

                  <button
                    className="btn btn-lg pull-xs-right btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Publish article
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @view() Preview() {
    const {Article, User, session} = this.$layer;

    const [handleFavorite, isHandlingFavorite] = useAsyncCallback(async () => {
      if (!session.user) {
        // eslint-disable-next-line no-alert
        window.alert('To add an article to your favorites, please sign in.');
        return;
      }

      if (!this.isFavoritedByAuthenticatedUser) {
        await this.addToAuthenticatedUserFavorites();
      } else {
        await this.removeFromAuthenticatedUserFavorites();
      }
    }, []);

    const favoriteButtonClass = this.isFavoritedByAuthenticatedUser ?
      'btn btn-sm btn-primary' :
      'btn btn-sm btn-outline-primary';

    return (
      <div className="article-preview">
        <div className="article-meta">
          <User.Main.Link params={this.author}>
            <this.author.ProfileImage />
          </User.Main.Link>

          <div className="info">
            <User.Main.Link params={this.author} className="author">
              {this.author.username}
            </User.Main.Link>
            <span className="date">{this.createdAt.toDateString()}</span>
          </div>

          <div className="pull-xs-right">
            <button
              className={favoriteButtonClass}
              onClick={handleFavorite}
              disabled={isHandlingFavorite}
            >
              <i className="ion-heart" /> {this.favoritesCount}
            </button>
          </div>
        </div>

        <Article.Main.Link params={this} className="preview-link">
          <h1>{this.title}</h1>
          <p>{this.description}</p>
          <span>Read more...</span>
        </Article.Main.Link>
      </div>
    );
  }
}
