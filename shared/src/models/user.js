import {Entity, field} from '@liaison/liaison';

export class User extends Entity {
  @field('string') email;

  @field('string') username;

  @field('string?') bio;

  @field('string?') imageURL;
}
