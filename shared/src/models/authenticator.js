import {SingletonModel, field} from '@liaison/liaison';

export class Authenticator extends SingletonModel {
  @field('string?') token;
}
