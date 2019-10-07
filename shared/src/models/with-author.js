import {field} from '@liaison/liaison';

export const WithAuthor = Base =>
  class WithAuthor extends Base {
    @field('User') author;

    @field('boolean?', {isVolatile: true}) authorIsFollowedByAuthenticatedUser;
  };
