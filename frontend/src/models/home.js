import React from 'react';
import {Registerable} from '@liaison/liaison';
import {Routable, route} from '@liaison/liaison';
import {view} from '@liaison/react-integration';

export class Home extends Routable(Registerable()) {
  @route('/') @view() static Main() {
    return <h2>Home</h2>;
  }
}
