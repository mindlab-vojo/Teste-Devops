import React from 'react';
import {Routable} from '@liaison/liaison';
import {Comment as BaseComment} from '@liaison/react-liaison-realworld-example-app-shared';
import {view, useAsyncCallback} from '@liaison/react-integration';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Comment extends Routable(BaseComment(WithAuthor(Entity))) {
  @view() Main({onDelete}) {
    const {User, authenticator} = this.$layer;

    const [handleDelete, isDeleting] = useAsyncCallback(async () => {
      await this.$delete();
      onDelete();
    }, []);

    return (
      <div className="card" style={{opacity: isDeleting ? 0.3 : 1}}>
        <div className="card-block">
          <p className="card-text">{this.body}</p>
        </div>

        <div className="card-footer">
          <User.Main.Link params={this.author} className="comment-author">
            <this.author.ProfileImage className="comment-author-img" />
          </User.Main.Link>
          &nbsp;
          <User.Main.Link params={this.author} className="comment-author">
            {this.author.username}
          </User.Main.Link>
          <span className="date-posted">{this.createdAt.toDateString()}</span>
          {this.author === authenticator.user && (
            <span className="mod-options">
              <i className="ion-trash-a" onClick={handleDelete} />
            </span>
          )}
        </div>
      </div>
    );
  }

  @view() Creator({onCreate}) {
    const [handleSave, , savingError] = useAsyncCallback(async () => {
      await this.$save();
      onCreate();
    }, []);

    return (
      <div>
        {savingError && <p>Sorry, something went wrong while saving your comment.</p>}
        <this.Form onSubmit={handleSave} />
      </div>
    );
  }

  @view() Form({onSubmit}) {
    const {authenticator} = this.$layer;

    const [handleSubmit, isSubmitting] = useAsyncCallback(
      async event => {
        event.preventDefault();
        await onSubmit();
      },
      [onSubmit]
    );

    return (
      <form onSubmit={handleSubmit} autoComplete="off" className="card comment-form">
        <div className="card-block">
          <textarea
            className="form-control"
            placeholder="Write a comment..."
            value={this.body || ''}
            onChange={event => {
              this.body = event.target.value;
            }}
            rows="3"
            disabled={isSubmitting}
          />
        </div>

        <div className="card-footer">
          <authenticator.user.ProfileImage className="comment-author-img" />
          <button type="submit" disabled={isSubmitting} className="btn btn-sm btn-primary">
            Post comment
          </button>
        </div>
      </form>
    );
  }
}
