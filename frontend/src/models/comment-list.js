import React from 'react';
import {Model, field} from '@liaison/liaison';
import {view, useAsyncMemo} from '@liaison/react-integration';

export class CommentList extends Model {
  @field(`Article`) article;

  @field(`Comment[]`) comments;

  @field(`Comment`) userComment;

  @view() static Main({article}) {
    const {Comment, session, common} = this.$layer;

    const [commentList, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      try {
        const comments = await Comment.$find(
          {article},
          {
            fields: {body: true, author: {username: true, imageURL: true}, createdAt: true},
            sort: {createdAt: -1}
          }
        );

        const userComment = session.user && new Comment({article});

        return new this({article, comments, userComment});
      } catch (error) {
        error.displayMessage = 'Sorry, something went wrong while loading the comments.';
        throw error;
      }
    }, [article]);

    if (isLoading) {
      return <common.LoadingSpinner />;
    }

    if (loadingError) {
      return <common.ErrorMessage error={loadingError} onRetry={retryLoading} />;
    }

    return <commentList.Main />;
  }

  @view() Main() {
    const {Comment, User} = this.$layer;

    return (
      <div className="col-xs-12 col-md-8 offset-md-2">
        {this.userComment ? (
          <div>
            <this.userComment.Creator
              onSave={() => {
                this.comments = [this.userComment, ...this.comments];
                this.userComment = new Comment({article: this.article});
              }}
            />
          </div>
        ) : (
          <p>
            <User.SignIn.Link>Sign in</User.SignIn.Link>
            &nbsp;or&nbsp;
            <User.SignUp.Link>Sign up</User.SignUp.Link>
            &nbsp;to add comments on this article.
          </p>
        )}

        <div>
          {this.comments.map(comment => {
            return (
              <comment.Main
                key={comment.id}
                onDelete={() => {
                  const deletedComment = comment;
                  this.comments = this.comments.filter(comment => comment !== deletedComment);
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
