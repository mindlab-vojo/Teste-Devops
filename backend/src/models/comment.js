import {field, method} from '@liaison/liaison';
import {Comment as BaseComment} from '@liaison/react-liaison-realworld-example-app-shared';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Comment extends BaseComment(WithAuthor(Entity)) {
  @field({expose: {get: 'anyone', set: 'creator'}}) article;

  @field({expose: {get: 'anyone', set: 'creator'}}) body;

  @method({expose: {call: 'anyone'}}) $load;

  @method({expose: {call: 'creator'}}) $save;

  @method({expose: {call: 'author'}}) $delete;

  @method({expose: {call: 'anyone'}}) static $find;
}
