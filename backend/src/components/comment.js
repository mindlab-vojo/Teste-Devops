import {expose, validators} from '@liaison/component';
import {attribute} from '@liaison/storable';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

const {rangeLength} = validators;

@expose({
  find: {call: 'anyone'},
  prototype: {
    load: {call: 'anyone'},
    save: {call: 'author'},
    delete: {call: 'author'}
  }
})
export class Comment extends WithAuthor(Entity) {
  @expose({get: 'anyone', set: 'author'}) @attribute('Article') article;

  @expose({get: 'anyone', set: 'author'})
  @attribute('string', {validators: [rangeLength([1, 50000])]})
  body = '';
}
