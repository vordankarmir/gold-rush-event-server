import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { validateEmail } from '../utils/email.validation';
import { v4 as uuidv4 } from 'uuid';
import { USER_TYPE } from '../src/user/types';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  _id: string;

  @Prop({
    required: true,
  })
  nickname: string;

  @Prop({
    required: true,
  })
  type: USER_TYPE;

  @Prop({
    required: true,
  })
  rank: number;

  @Prop({
    required: true,
  })
  silverNuggets: number;

  @Prop({
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: false,
  })
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
