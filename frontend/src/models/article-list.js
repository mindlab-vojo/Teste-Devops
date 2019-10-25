import React from 'react';
import {Model, field} from '@liaison/liaison';
import {view, useAsyncMemo} from '@liaison/react-integration';

export class ArticleList extends Model {
  @field(`Article[]`) articles;

  @view() static Main({filter}) {
    const {Article, common} = this.$layer;

    const [articleList, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      try {
        const articles = await Article.$find({
          filter,
          fields: {
            title: true,
            description: true,
            tags: true,
            slug: true,
            author: {username: true, imageURL: true},
            createdAt: true,
            favoritesCount: true,
            isFavoritedBySessionUser: true
          },
          sort: {createdAt: -1}
        });

        return new this({articles});
      } catch (error) {
        error.displayMessage = 'Sorry, something went wrong while loading the articles.';
        throw error;
      }
    }, [JSON.stringify(filter)]);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return <common.ErrorMessage error={loadingError} onRetry={retryLoading} />;
    }

    return <articleList.Main />;
  }

  @view() Main() {
    if (this.articles.length === 0) {
      return <div className="article-preview">No articles are here... yet.</div>;
    }

    return (
      <div>
        {this.articles.map(article => {
          return <article.Preview key={article.slug} />;
        })}
      </div>
    );
  }
}
