import React, {useState, useMemo} from 'react';
import {Routable, route} from '@liaison/liaison';
import {User as BaseUser} from '@liaison/react-liaison-realworld-example-app-shared';
import {view, useAsyncCallback} from '@liaison/react-integration';

import {Entity} from './entity';

const PROFILE_IMAGE_PLACEHOLDER = '//static.productionready.io/images/smiley-cyrus.jpg';

export class User extends Routable(BaseUser(Entity)) {
  @route('/:mentionName<@[a-zA-Z0-9]+>') static Main({mentionName}) {
    this.Articles.redirect({mentionName});
  }

  @route('/:mentionName<@[a-zA-Z0-9]+>/articles') static Articles({mentionName}) {
    return this.Content({mentionName});
  }

  @route('/:mentionName<@[a-zA-Z0-9]+>/favorites') static Favorites({mentionName}) {
    return this.Content({mentionName});
  }

  static Content({mentionName}) {
    const username = this.mentionNameToUsername(mentionName);

    return (
      <this.Loader
        query={{username}}
        fields={{username: true, bio: true, imageURL: true, isFollowedBySessionUser: true}}
      >
        {user => <user.Content />}
      </this.Loader>
    );
  }

  @view() Content() {
    const {ArticleList, router} = this.$layer;

    const currentRoute = router.getCurrentRoute();

    const articleFilter = useMemo(() => {
      if (currentRoute === this.constructor.Favorites) {
        return {isFavoritedBy: this};
      }
      return {author: this};
    }, [currentRoute]);

    return (
      <div className="profile-page">
        <div className="user-info">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                <this.ProfileImage className="user-img" />
                <h4>{this.username}</h4>
                <p>{this.bio}</p>
                <this.Actions />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <this.Tabs />
              <ArticleList.Main filter={articleFilter} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  @view() Actions() {
    const {session} = this.$layer;

    if (!session.user) {
      return null;
    }

    if (this === session.user) {
      return (
        <this.constructor.Settings.Link className="btn btn-sm btn-outline-secondary action-btn">
          <i className="ion-gear-a" /> Edit profile settings
        </this.constructor.Settings.Link>
      );
    }

    const FollowButton = () => {
      const [handleFollow, isHandlingFollow] = useAsyncCallback(async () => {
        await session.user.follow(this);
      }, []);

      return (
        <button
          className="btn btn-sm action-btn btn-outline-secondary"
          onClick={handleFollow}
          disabled={isHandlingFollow}
        >
          <i className="ion-plus-round" /> Follow {this.username}
        </button>
      );
    };

    const UnfollowButton = () => {
      const [handleUnfollow, isHandlingUnfollow] = useAsyncCallback(async () => {
        await session.user.unfollow(this);
      }, []);

      return (
        <button
          className="btn btn-sm action-btn btn-secondary"
          onClick={handleUnfollow}
          disabled={isHandlingUnfollow}
        >
          <i className="ion-plus-round" /> Unfollow {this.username}
        </button>
      );
    };

    return this.isFollowedBySessionUser ? <UnfollowButton /> : <FollowButton />;
  }

  @view() Tabs() {
    return (
      <div className="articles-toggle">
        <ul className="nav nav-pills outline-active">
          <li className="nav-item">
            <this.constructor.Articles.Link
              params={this}
              className="nav-link"
              activeClassName="active"
            >
              My articles
            </this.constructor.Articles.Link>
          </li>

          <li className="nav-item">
            <this.constructor.Favorites.Link
              params={this}
              className="nav-link"
              activeClassName="active"
            >
              Favorited articles
            </this.constructor.Favorites.Link>
          </li>
        </ul>
      </div>
    );
  }

  @view() ProfileImage({className = 'user-pic'}) {
    return (
      <img
        src={this.imageURL || PROFILE_IMAGE_PLACEHOLDER}
        className={className}
        alt="User's profile image"
      />
    );
  }

  @route('/register') @view() static Register() {
    const {Home} = this.$layer;

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [handleRegister, isRegistering] = useAsyncCallback(async () => {
      await this.register({email, username, password});
      Home.Main.reload();
    }, [email, username, password]);

    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign Up</h1>

              <p className="text-xs-center">
                <this.Login.Link>Have an account?</this.Login.Link>
              </p>

              <form
                onSubmit={event => {
                  event.preventDefault();
                  handleRegister();
                }}
              >
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={event => setUsername(event.target.value)}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={isRegistering}
                  >
                    Sign up
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  static async register({email, username, password} = {}) {
    const {session} = this.$layer;

    const user = await super.register({email, username, password});
    session.user = user;
    return user;
  }

  @route('/login') @view() static Login() {
    const {Home} = this.$layer;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [handleLogin, isLogining] = useAsyncCallback(async () => {
      await this.login({email, password});
      Home.Main.reload();
    }, [email, password]);

    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign In</h1>

              <p className="text-xs-center">
                <this.Register.Link>Need an account?</this.Register.Link>
              </p>

              <form
                onSubmit={event => {
                  event.preventDefault();
                  handleLogin();
                }}
              >
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      required
                    />
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={isLogining}
                  >
                    Sign in
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  static async login({email, password} = {}) {
    const {session} = this.$layer;

    const user = await super.login({email, password});
    session.user = user;
    return user;
  }

  static logout() {
    const {session} = this.$layer;

    session.token = undefined;
    session.user = undefined;
  }

  @route('/settings') @view() static Settings() {
    const {Home, session} = this.$layer;

    if (!session.user) {
      Home.Main.redirect();
      return null;
    }

    return <session.user.Settings />;
  }

  @view() Settings() {
    const {Home} = this.$layer;

    const fork = useMemo(() => this.$fork().$detach(), []);

    const [handleUpdate, , updatingError] = useAsyncCallback(async () => {
      const savedFork = await fork.$save();
      this.$merge(savedFork);
      Home.Main.navigate();
    }, [fork]);

    return (
      <div className="settings-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Your Settings</h1>

              {updatingError && (
                <p>Sorry, something went wrong while updating your user information.</p>
              )}

              <fork.SettingsForm onSubmit={handleUpdate} />

              <hr />

              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  this.constructor.logout();
                  Home.Main.reload();
                }}
              >
                Or click here to logout.
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @view() SettingsForm({onSubmit}) {
    const [handleSubmit, isSubmitting] = useAsyncCallback(
      async event => {
        event.preventDefault();
        await onSubmit();
      },
      [onSubmit]
    );

    return (
      <form onSubmit={handleSubmit} autoComplete="off">
        <fieldset>
          <fieldset className="form-group">
            <input
              className="form-control"
              type="url"
              placeholder="URL of profile picture"
              value={this.imageURL}
              onChange={event => {
                this.imageURL = event.target.value;
              }}
            />
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={this.username}
              onChange={event => {
                this.username = event.target.value;
              }}
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows="8"
              placeholder="Short bio about you"
              value={this.bio}
              onChange={event => {
                this.bio = event.target.value;
              }}
            ></textarea>
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={this.email}
              onChange={event => {
                this.email = event.target.value;
              }}
              autoComplete="off"
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="New password"
              value={this.$getFieldValue('password', {throwIfInactive: false}) || ''}
              onChange={event => {
                const value = event.target.value;
                if (value) {
                  this.password = value;
                } else {
                  this.password = undefined;
                  this.$deactivateField('password');
                }
              }}
              autoComplete="new-password"
            />
          </fieldset>

          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={isSubmitting}
          >
            Update settings
          </button>
        </fieldset>
      </form>
    );
  }
}
