import {Model, field} from '@liaison/liaison';
import React from 'react';
import {view} from '@liaison/react-integration';

export class App extends Model {
  @field('string') name;

  @field('string') description;

  @view() Header() {
    const {Home} = this.$layer;

    return (
      <nav className="navbar navbar-light">
        <div className="container">
          <Home.Main.Link className="navbar-brand">{this.name.toLowerCase()}</Home.Main.Link>

          <this.Menu />
        </div>
      </nav>
    );
  }

  @view() Menu() {
    const {Home, Article, User, authenticator} = this.$layer;

    const {user} = authenticator;

    if (user) {
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
          <User.Login.Link className="nav-link">Sign in</User.Login.Link>
        </li>

        <li className="nav-item">
          <User.Register.Link className="nav-link">Sign up</User.Register.Link>
        </li>
      </ul>
    );
  }

  @view() Banner() {
    return (
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">{this.name.toLowerCase()}</h1>
          <p>{this.description}</p>
        </div>
      </div>
    );
  }
}
