import React, {useState, useMemo, useCallback} from 'react';
import {Routable, route} from '@liaison/liaison';
import {Article as BaseArticle} from '@liaison/react-liaison-realworld-example-app-shared';
import {view, useAsyncCallback, useAsyncMemo} from '@liaison/react-integration';
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
          tags: true,
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
              <this.TagList />
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

  @view() Preview() {
    const {Article, User, session} = this.$layer;

    const [handleFavorite, isHandlingFavorite] = useAsyncCallback(async () => {
      if (!session.user) {
        // eslint-disable-next-line no-alert
        window.alert('To add an article to your favorites, please sign in.');
        return;
      }

      if (!this.isFavoritedBySessionUser) {
        await session.user.favorite(this);
      } else {
        await session.user.unfavorite(this);
      }
    }, []);

    const favoriteButtonClass = this.isFavoritedBySessionUser
      ? 'btn btn-sm btn-primary'
      : 'btn btn-sm btn-outline-primary';

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
          <this.TagList />
        </Article.Main.Link>
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

  @view() TagList() {
    return (
      <ul className="tag-list">
        {this.tags.map(tag => (
          <li key={tag} className="tag-default tag-pill tag-outline">
            {tag}
          </li>
        ))}
      </ul>
    );
  }

  @view() Actions() {
    const {Home, Article, common, session} = this.$layer;

    if (this.author !== session.user) {
      return null;
    }

    const handleEdit = useCallback(() => {
      Article.Editor.$navigate(this);
    }, []);

    const [handleDelete, isDeleting, deletingError] = useAsyncCallback(async () => {
      await this.$delete();
      Home.Main.$navigate();
    }, []);

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

        {deletingError && <common.ErrorMessage error={deletingError} />}
      </span>
    );
  }

  @route('/editor') @view() static Creator() {
    const {Home, session} = this.$layer;

    if (!session.user) {
      Home.Main.$redirect();
      return null;
    }

    const article = useMemo(() => new this());

    return <article.Creator />;
  }

  @view() Creator() {
    const {Article, common} = this.$layer;

    const [handleSave, , savingError] = useAsyncCallback(async () => {
      await this.$save();
      Article.Main.$navigate(this);
    }, []);

    return (
      <div>
        {savingError && <common.ErrorMessage error={savingError} />}

        <this.Form onSubmit={handleSave} />
      </div>
    );
  }

  @route('/editor/:slug') @view() static Editor({slug}) {
    return (
      <this.Loader query={{slug}} fields={{title: true, description: true, body: true, tags: true}}>
        {article => <article.Editor />}
      </this.Loader>
    );
  }

  @view() Editor() {
    const {Article, common} = this.$layer;

    const fork = useMemo(() => this.$fork(), []);

    const [handleSave, , savingError] = useAsyncCallback(async () => {
      await fork.$save();
      this.$merge(fork);
      Article.Main.$navigate(this);
    }, [fork]);

    return (
      <div>
        {savingError && <common.ErrorMessage error={savingError} />}

        <fork.Form onSubmit={handleSave} />
      </div>
    );
  }

  @view() Form({onSubmit}) {
    const [tag, setTag] = useState('');

    const [handleSubmit, isSubmitting] = useAsyncCallback(
      async event => {
        event.preventDefault();
        await onSubmit();
      },
      [onSubmit]
    );

    const handleAddTag = useCallback(() => {
      const trimmedTag = tag.trim();
      if (trimmedTag !== '') {
        this.tags = [...this.tags, trimmedTag];
        setTag('');
      }
    });

    const handleRemoveTag = useCallback(tagToRemove => {
      this.tags = this.tags.filter(tag => tag !== tagToRemove);
    });

    const handleTagKeyDown = useCallback(event => {
      const TAB = 9;
      const ENTER = 13;
      const COMMA = 188;

      const {keyCode} = event;

      if (keyCode === TAB || keyCode === ENTER || keyCode === COMMA) {
        if (keyCode !== TAB) {
          event.preventDefault();
        }
        handleAddTag();
      }
    });

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
                      value={this.title}
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
                      value={this.description}
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
                      value={this.body}
                      onChange={event => {
                        this.body = event.target.value;
                      }}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter tags"
                      value={tag}
                      onChange={event => {
                        setTag(event.target.value);
                      }}
                      onBlur={handleAddTag}
                      onKeyDown={handleTagKeyDown}
                    />

                    <div className="tag-list">
                      {this.tags.map(tag => {
                        return (
                          <span className="tag-default tag-pill" key={tag}>
                            <i className="ion-close-round" onClick={() => handleRemoveTag(tag)} />
                            {tag}
                          </span>
                        );
                      })}
                    </div>
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

  @view() static PopularTagList() {
    const {Home, common} = this.$layer;

    const [tags, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      try {
        return await this.findPopularTags();
      } catch (error) {
        error.displayMessage = 'Sorry, something went wrong while loading the popular tags.';
        throw error;
      }
    }, []);

    if (isLoading) {
      return <common.LoadingSpinner />;
    }

    if (loadingError) {
      return <common.ErrorMessage error={loadingError} onRetry={retryLoading} />;
    }

    return (
      <div className="tag-list">
        {tags.map(tag => {
          return (
            <Home.TagFeed.Link key={tag} params={{tag}} className="tag-default tag-pill">
              {tag}
            </Home.TagFeed.Link>
          );
        })}
      </div>
    );
  }
}
