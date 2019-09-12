import {Entity, field, validators} from '@liaison/liaison';

const {notEmpty, maxLength, rangeLength} = validators;

export class User extends Entity {
  @field('string', {validators: [rangeLength([3, 100])]}) email;

  @field('string', {validators: [notEmpty(), maxLength(50)]}) username;

  @field('string?', {validators: [notEmpty(), maxLength(100)]}) password; // Saved as 'passwordHash'

  @field('string?', {validators: [maxLength(200)]}) bio;

  @field('string?', {validators: [maxLength(200)]}) imageURL;
}
