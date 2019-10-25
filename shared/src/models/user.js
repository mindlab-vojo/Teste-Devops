import {field, validators} from '@liaison/liaison';

const {notEmpty, maxLength, rangeLength, match} = validators;

export const User = Base =>
  class User extends Base {
    @field('string', {isUnique: true, validators: [rangeLength([3, 100])]}) email = '';

    @field('string', {
      isUnique: true,
      validators: [notEmpty(), maxLength(50), match(/^[a-zA-Z0-9]+$/)]
    })
    username = '';

    @field('string?', {validators: [notEmpty(), maxLength(100)]}) password = '';

    @field('string', {validators: [maxLength(200)]}) bio = '';

    @field('string', {validators: [maxLength(200)]}) imageURL = '';

    @field('boolean?', {isVolatile: true}) isFollowedBySessionUser;

    get mentionName() {
      return this.constructor.usernameToMentionName(this.username);
    }

    static usernameToMentionName(username) {
      return '@' + username;
    }

    static mentionNameToUsername(mentionName) {
      return mentionName.slice(1);
    }
  };
