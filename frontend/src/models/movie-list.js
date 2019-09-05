import React, {useCallback} from 'react';
import {DocumentList, Routable, route} from '@liaison/liaison';
import {view, useAsyncMemo} from '@liaison/react-integration';

export class MovieList extends Routable(DocumentList('Movie')) {
  @view() static Layout({children}) {
    return (
      <div>
        <h2>Movies</h2>
        {children}
      </div>
    );
  }

  @route('/movies', {aliases: ['/']}) @view() static Main() {
    const {common} = this.layer;

    const [movieList, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      const movieList = new this();
      await movieList.load({fields: {title: true, year: true}});
      return movieList;
    }, []);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return (
        <common.ErrorMessage
          message="Sorry, something went wrong while loading the movies."
          onRetry={retryLoading}
        />
      );
    }

    return (
      <this.Layout>
        <movieList.Main />
      </this.Layout>
    );
  }

  @view() Main() {
    const {Movie} = this.layer;

    const handleNew = useCallback(() => {
      Movie.Creator.navigate();
    }, []);

    return (
      <>
        <ul>
          {this.items.map(movie => (
            <movie.ListItem key={movie.id} />
          ))}
        </ul>
        <p>
          <button onClick={handleNew}>New</button>
        </p>
      </>
    );
  }
}
