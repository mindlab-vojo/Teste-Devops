import React from 'react';
import {Model, field} from '@liaison/liaison';
import {view, useAsyncMemo} from '@liaison/react-integration';

export class ArticleList extends Model {
  @field(`Article[]?`) items;

  @view() static Main({filter}) {
    const {Article, common} = this.$layer;

    const [articleList, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      const articleList = new this();
      articleList.items = await Article.$find({
        filter,
        fields: {
          title: true,
          description: true,
          slug: true,
          author: {username: true, imageURL: true},
          createdAt: true,
          favoritesCount: true,
          isFavoritedByAuthenticatedUser: true
        },
        sort: {createdAt: -1}
      });
      return articleList;
    }, [filter]);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return (
        <common.ErrorMessage
          message="Sorry, something went wrong while loading the articles."
          onRetry={retryLoading}
        />
      );
    }

    return <articleList.Main />;
  }

  @view() Main() {
    if (this.items.length === 0) {
      return <div className="article-preview">No articles are here... yet.</div>;
    }

    return (
      <div>
        {this.items.map(article => {
          return <article.Preview key={article.slug} />;
        })}
      </div>
    );
  }
}
