import {Entity, field, validators} from '@liaison/liaison';

const {maxLength, rangeLength} = validators;

export class User extends Entity {
  @field('string', {validators: [rangeLength([3, 128])]}) email;

  @field('string', {validators: [rangeLength([1, 64])]}) username;

  @field('string?', {validators: [rangeLength([1, 128])]}) password; // Saved as 'passwordHash'

  @field('string', {validators: [maxLength(128)]}) bio = '';

  @field('string', {validators: [maxLength(256)]}) imageURL = '';
}
