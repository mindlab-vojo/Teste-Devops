import {field, method} from '@liaison/liaison';
import {Comment as BaseComment} from '@liaison/react-liaison-realworld-example-app-shared';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Comment extends BaseComment(WithAuthor(Entity)) {
  @field({expose: {get: 'any', set: 'creator'}}) article;

  @field({expose: {get: 'any', set: 'creator'}}) body;

  @method({expose: {call: 'any'}}) $load;

  @method({expose: {call: 'creator'}}) $save;

  @method({expose: {call: 'author'}}) $delete;

  @method({expose: {call: 'any'}}) static $find;
}
