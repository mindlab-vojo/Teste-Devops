import {Singleton, field} from '@liaison/liaison';

export class Authenticator extends Singleton {
  @field('string?') token;
}
