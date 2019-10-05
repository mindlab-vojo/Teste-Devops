import React from 'react';
import {Model, field} from '@liaison/liaison';
import {view, useAsyncMemo} from '@liaison/react-integration';

export class CommentList extends Model {
  @field(`Article`) article;

  @field(`Comment[]`) comments;

  @field(`Comment`) userComment;

  @view() static Main({article}) {
    const {Comment, authenticator, common} = this.$layer;

    const [commentList, isLoading, loadingError, retryLoading] = useAsyncMemo(async () => {
      const comments = await Comment.$find({
        filter: {article},
        fields: {body: true, author: {username: true, imageURL: true}, createdAt: true},
        sort: {createdAt: -1}
      });

      const userComment = authenticator.user && new Comment({article});

      return new this({article, comments, userComment});
    }, [article]);

    if (isLoading) {
      return <common.LoadingMessage />;
    }

    if (loadingError) {
      return (
        <common.ErrorMessage
          message="Sorry, something went wrong while loading the comments."
          onRetry={retryLoading}
        />
      );
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
              onCreate={() => {
                this.comments = [this.userComment, ...this.comments]; // TODO: Use unshift()
                this.userComment = new Comment({article: this.article});
              }}
            />
          </div>
        ) : (
          <p>
            <User.Login.Link>Sign in</User.Login.Link>
            &nbsp;or&nbsp;
            <User.Register.Link>Sign up</User.Register.Link>
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
