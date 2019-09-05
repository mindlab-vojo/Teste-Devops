import React, {useMemo, useCallback} from 'react';
import {Routable, route} from '@liaison/liaison';
import {view, useAsyncMemo, useAsyncCallback} from '@liaison/react-integration';
import {Movie as BaseMovie} from '@liaison/react-liaison-realworld-example-app-shared';

export class Movie extends Routable(BaseMovie) {
  @view() static Layout({children}) {
    return (
      <div>
        <h2>Movie</h2>
        {children}
      </div>
    );
  }

  @view() static Loader({id, children}) {
    const {common} = this.layer;

    const [movie, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      return await this.get(id, {fields: {title: true, year: true, country: true}});
    }, [id]);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return (
        <common.ErrorMessage
          message="Sorry, something went wrong while loading the movie."
          onRetry={retryLoading}
        />
      );
    }

    return children(movie);
  }

  @route('/movies/:id') @view() static Main({id}) {
    const {MovieList, router} = this.layer;

    return (
      <this.Layout>
        <this.Loader id={id}>{movie => <movie.Main />}</this.Loader>
        <p>
          ‹ <router.Link href={`${MovieList.Main.getPath()}`}>Back</router.Link>
        </p>
      </this.Layout>
    );
  }

  @view() Main() {
    const {MovieList} = this.layer;

    const handleEdit = useCallback(() => {
      this.constructor.Editor.navigate(this);
    }, []);

    const [handleDelete, isDeleting, deletingError] = useAsyncCallback(async () => {
      await this.delete();
      MovieList.Main.navigate();
    }, []);

    return (
      <div>
        {deletingError && <p>Sorry, something went wrong while deleting the movie.</p>}
        <table>
          <tbody>
            <tr>
              <td>Title:</td>
              <td>{this.title}</td>
            </tr>
            <tr>
              <td>Year:</td>
              <td>{this.year}</td>
            </tr>
            <tr>
              <td>Country:</td>
              <td>{this.country}</td>
            </tr>
          </tbody>
        </table>
        <p>
          <button onClick={handleEdit} disabled={isDeleting}>
            Edit
          </button>
          &nbsp;
          <button onClick={handleDelete} disabled={isDeleting}>
            Delete
          </button>
        </p>
      </div>
    );
  }

  @route('/movies/-/create') @view() static Creator() {
    const movie = useMemo(() => {
      return new this();
    });

    return (
      <this.Layout>
        <movie.Creator />
      </this.Layout>
    );
  }

  @view() Creator() {
    const {MovieList, router} = this.layer;

    const [handleSave, isSaving, savingError] = useAsyncCallback(async () => {
      await this.save();
      MovieList.Main.navigate();
    }, []);

    return (
      <div>
        {savingError && <p>Sorry, something went wrong while saving the movie.</p>}
        <this.Form onSave={handleSave} isSaving={isSaving} />
        <p>
          ‹ <router.Link href={MovieList.Main.getPath()}>Back</router.Link>
        </p>
      </div>
    );
  }

  @route('/movies/:id/edit') @view() static Editor({id}) {
    return (
      <this.Layout>
        <this.Loader id={id}>{movie => <movie.Editor />}</this.Loader>
      </this.Layout>
    );
  }

  @view() Editor() {
    const {router} = this.layer;

    const clone = useMemo(() => {
      return this.clone();
    }, []);

    const [handleSave, isSaving, savingError] = useAsyncCallback(async () => {
      this.assign(clone);
      await this.save();
      this.constructor.Main.navigate(this);
    }, [clone]);

    return (
      <div>
        {savingError && <p>Sorry, something went wrong while saving the movie.</p>}
        <clone.Form onSave={handleSave} isSaving={isSaving} />
        <p>
          ‹ <router.Link href={this.constructor.Main.getPath(this)}>Back</router.Link>
        </p>
      </div>
    );
  }

  @view() Form({onSave, isSaving}) {
    const handleSubmit = useCallback(
      event => {
        event.preventDefault();
        onSave();
      },
      [onSave]
    );

    const title = this.title || '';

    const handleTitleChange = useCallback(event => {
      this.title = event.target.value;
    }, []);

    const year = this.year !== undefined ? String(this.year) : '';

    const handleYearChange = useCallback(event => {
      this.year = Number(event.target.value) || undefined;
    }, []);

    const country = this.country || '';

    const handleCountryChange = useCallback(event => {
      this.country = event.target.value;
    }, []);

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <table>
            <tbody>
              <tr>
                <td>Title:</td>
                <td>
                  <input value={title} onChange={handleTitleChange} />
                </td>
              </tr>
              <tr>
                <td>Year:</td>
                <td>
                  <input value={year} onChange={handleYearChange} />
                </td>
              </tr>
              <tr>
                <td>Country:</td>
                <td>
                  <input value={country} onChange={handleCountryChange} />
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <button type="submit" disabled={isSaving}>
              Save
            </button>
          </p>
        </form>
      </div>
    );
  }

  @view() ListItem() {
    const {router} = this.layer;

    return (
      <li>
        <router.Link href={`${this.constructor.Main.getPath(this)}`}>{this.title}</router.Link> (
        {this.year})
      </li>
    );
  }
}
