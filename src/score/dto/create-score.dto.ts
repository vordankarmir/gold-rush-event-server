import Joi from 'joi';

export class CreateScoreDto {
  readonly score: number;
}

export const createScoreSchema = Joi.object({
  score: Joi.number().min(1).required(),
});
