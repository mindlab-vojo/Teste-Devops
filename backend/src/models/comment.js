import {expose} from '@liaison/liaison';
import {Comment as BaseComment} from '@liaison/react-liaison-realworld-example-app-shared';

import {Entity} from './entity';
import {WithAuthor} from './with-author';

export class Comment extends BaseComment(WithAuthor(Entity)) {
  @expose({get: 'any', set: 'new'}) article;

  @expose({get: 'any', set: 'new'}) body;

  @expose({call: 'any'}) $load;

  @expose({call: 'new'}) $save;

  @expose({call: 'author'}) $delete;

  @expose({call: 'any'}) static $find;
}
