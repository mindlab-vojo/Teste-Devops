import React from 'react';
import {Registerable} from '@liaison/liaison';
import {Routable, route} from '@liaison/liaison';
import {view} from '@liaison/react-integration';

export class Home extends Routable(Registerable()) {
  @route('/') static Main() {
    const {session} = this.$layer;

    if (session.user) {
      this.UserFeed.redirect();
    } else {
      this.GlobalFeed.redirect();
    }
  }

  @route('/home') static UserFeed() {
    const {session} = this.$layer;

    if (!session.user) {
      this.Main.redirect();
      return;
    }

    return this.Content({articleFilter: {authorIsFollowedBySessionUser: true}});
  }

  @route('/all') static GlobalFeed() {
    return this.Content({articleFilter: {}});
  }

  @route('/tags/:tag') static TagFeed({tag}) {
    return this.Content({articleFilter: {tags: tag}});
  }

  @view() static Content({articleFilter}) {
    const {Article, ArticleList, app, session} = this.$layer;

    return (
      <div className="home-page">
        {!session.user && <app.Banner />}

        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <this.Tabs />
              <ArticleList.Main filter={articleFilter} />
            </div>

            <div className="col-md-3">
              <div className="sidebar">
                <p>Popular tags</p>
                <Article.PopularTagList />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @view() static Tabs() {
    const {session, router} = this.$layer;

    const {tag} = router.getCurrentParams();

    return (
      <div className="feed-toggle">
        <ul className="nav nav-pills outline-active">
          {session.user && (
            <li className="nav-item">
              <this.UserFeed.Link className="nav-link" activeClassName="active">
                Your feed
              </this.UserFeed.Link>
            </li>
          )}

          <li className="nav-item">
            <this.GlobalFeed.Link className="nav-link" activeClassName="active">
              Global feed
            </this.GlobalFeed.Link>
          </li>

          {tag && (
            <li className="nav-item">
              <this.TagFeed.Link params={{tag}} className="nav-link" activeClassName="active">
                <i className="ion-pound" /> {tag}
              </this.TagFeed.Link>
            </li>
          )}
        </ul>
      </div>
    );
  }
}
