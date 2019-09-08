import {Document, field} from '@liaison/liaison';

export class User extends Document {
  @field('string') email;

  @field('string') username;

  @field('string?') bio;

  @field('string?') imageURL;
}
