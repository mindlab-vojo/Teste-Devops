import {expose} from '@liaison/liaison';
import {Comment as BaseComment} from '@liaison/react-liaison-realworld-example-app-shared';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Comment extends BaseComment(WithAuthor(Entity)) {
  @expose({get: 'any', set: 'author'}) article;

  @expose({get: 'any', set: 'author'}) body;

  @expose({call: 'any'}) static $load;

  @expose({call: 'author'}) static $save;

  @expose({call: 'author'}) static $delete;

  @expose({call: 'any'}) static $find;
}
