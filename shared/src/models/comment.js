import {field, validators} from '@liaison/liaison';

const {rangeLength} = validators;

export const Comment = Base =>
  class Comment extends Base {
    @field('Article') article;

    @field('string', {validators: [rangeLength([1, 50000])]}) body = '';
  };
