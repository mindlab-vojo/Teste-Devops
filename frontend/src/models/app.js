import {Model, field} from '@liaison/liaison';
import React from 'react';
import {view} from '@liaison/react-integration';

export class App extends Model {
  @field('string') name;

  @field('string') description;

  @view() Header() {
    const {Home} = this.layer;

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
    const {Home, User, authenticator} = this.layer;

    return (
      <authenticator.Loader>
        {user => {
          if (user) {
            return (
              <ul className="nav navbar-nav pull-xs-right">
                <li className="nav-item">
                  <Home.Main.Link className="nav-link">Home</Home.Main.Link>
                </li>

                <li className="nav-item">
                  <User.Settings.Link className="nav-link">
                    <i className="ion-gear-a" /> Settings
                  </User.Settings.Link>
                </li>

                <li className="nav-item">
                  <Home.Main.Link className="nav-link">{user.username}</Home.Main.Link>
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
                <authenticator.Login.Link className="nav-link">Sign in</authenticator.Login.Link>
              </li>

              <li className="nav-item">
                <authenticator.Register.Link className="nav-link">
                  Sign up
                </authenticator.Register.Link>
              </li>
            </ul>
          );
        }}
      </authenticator.Loader>
    );
  }
}
