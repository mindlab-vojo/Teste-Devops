import {Entity, field, validators} from '@liaison/liaison';

const {notEmpty, maxLength, rangeLength} = validators;

export class Article extends Entity {
  @field('string', {validators: [notEmpty(), maxLength(200)]}) title;

  @field('string', {validators: [rangeLength([1, 500])]}) description;

  @field('string', {validators: [rangeLength([1, 50000])]}) body;

  @field('string?', {validators: [rangeLength([8, 300])]}) slug;

  @field('User') author;
}
