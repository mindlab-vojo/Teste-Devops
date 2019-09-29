import {Storable, Entity, field, validators} from '@liaison/liaison';

const {notEmpty, maxLength, rangeLength, match} = validators;

export class User extends Storable(Entity) {
  @field('string', {isUnique: true, validators: [rangeLength([3, 100])]}) email;

  @field('string', {
    isUnique: true,
    validators: [notEmpty(), maxLength(50), match(/^[a-zA-Z0-9]+$/)]
  })
  username;

  @field('string?', {validators: [notEmpty(), maxLength(100)]}) password; // Saved as 'passwordHash'

  @field('string?', {validators: [maxLength(200)]}) bio;

  @field('string?', {validators: [maxLength(200)]}) imageURL;

  @field('boolean?') isFollowedByAuthenticatedUser;

  get mentionName() {
    return this.constructor.usernameToMentionName(this.username);
  }

  static usernameToMentionName(username) {
    return '@' + username;
  }

  static mentionNameToUsername(mentionName) {
    return mentionName.slice(1);
  }
}
