import {Document, field} from '@liaison/liaison';

export class Movie extends Document {
  @field('string') title;

  @field('number') year;

  @field('string') country;
}
