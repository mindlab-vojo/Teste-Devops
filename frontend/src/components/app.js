import {Component, consume} from '@liaison/component';
import React from 'react';
import {view} from '@liaison/react-integration';

export const getApp = ({name, description}) =>
  class App extends Component {
    @consume() static Session;
    @consume() static Home;
    @consume() static User;
    @consume() static Article;

    static getTitle() {
      return name;
    }

    @view() static Header() {
      const {Home} = this;

      return (
        <nav className="navbar navbar-light">
          <div className="container">
            <Home.Main.Link className="navbar-brand">{name.toLowerCase()}</Home.Main.Link>

            <this.Menu />
          </div>
        </nav>
      );
    }

    @view() static Menu() {
      const {Home, User, Article, Session} = this;

      const {user} = Session;

      if (user !== undefined) {
        return (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <Home.Main.Link className="nav-link">Home</Home.Main.Link>
            </li>

            <li className="nav-item">
              <Article.Creator.Link className="nav-link">
                <i className="ion-compose" /> New post
              </Article.Creator.Link>
            </li>

            <li className="nav-item">
              <User.Settings.Link className="nav-link">
                <i className="ion-gear-a" /> Settings
              </User.Settings.Link>
            </li>

            <li className="nav-item">
              <User.Main.Link params={user} className="nav-link">
                <user.ProfileImage />
                {user.username}
              </User.Main.Link>
            </li>
          </ul>
        );
      }

      return (
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <Home.Main.Link className="nav-link">Home</Home.Main.Link>
          </li>

          <li className="nav-item">
            <User.SignIn.Link className="nav-link">Sign in</User.SignIn.Link>
          </li>

          <li className="nav-item">
            <User.SignUp.Link className="nav-link">Sign up</User.SignUp.Link>
          </li>
        </ul>
      );
    }

    @view() static Banner() {
      return (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">{name.toLowerCase()}</h1>
            <p>{description}</p>
          </div>
        </div>
      );
    }
  };
