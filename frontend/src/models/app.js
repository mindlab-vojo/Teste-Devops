import {Model, field} from '@liaison/liaison';
import React from 'react';
import {view} from '@liaison/react-integration';

export class App extends Model {
  @field('string') name;

  @field('string') description;

  @view() Header() {
    const {Home, router} = this.layer;

    return (
      <nav className="navbar navbar-light">
        <div className="container">
          <router.Link href={Home.Main.getPath()} className="navbar-brand">
            {this.name.toLowerCase()}
          </router.Link>

          <this.Menu />
        </div>
      </nav>
    );
  }

  @view() Menu() {
    const {Home, User, authenticator, router} = this.layer;

    return (
      <authenticator.Loader>
        {user => {
          if (user) {
            return (
              <ul className="nav navbar-nav pull-xs-right">
                <li className="nav-item">
                  <router.Link href={Home.Main.getPath()} className="nav-link">
                    Home
                  </router.Link>
                </li>

                <li className="nav-item">
                  <router.Link href={User.Settings.getPath()} className="nav-link">
                    <i className="ion-gear-a" /> Settings
                  </router.Link>
                </li>

                <li className="nav-item">
                  <router.Link href={Home.Main.getPath()} className="nav-link">
                    {user.username}
                  </router.Link>
                </li>
              </ul>
            );
          }

          return (
            <ul className="nav navbar-nav pull-xs-right">
              <li className="nav-item">
                <router.Link href={Home.Main.getPath()} className="nav-link">
                  Home
                </router.Link>
              </li>

              <li className="nav-item">
                <router.Link href={authenticator.Login.getPath()} className="nav-link">
                  Sign in
                </router.Link>
              </li>

              <li className="nav-item">
                <router.Link href={authenticator.Register.getPath()} className="nav-link">
                  Sign up
                </router.Link>
              </li>
            </ul>
          );
        }}
      </authenticator.Loader>
    );
  }
}
