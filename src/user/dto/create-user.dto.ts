import Joi from 'joi';
import { USER_TYPE } from '../types';

export class CreateUserDto {
  readonly nickname: string;

  readonly type: USER_TYPE;

  readonly email: string;

  readonly password: string;
}

export const signUpSchema = Joi.object({
  nickname: Joi.string().required(),
  type: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
