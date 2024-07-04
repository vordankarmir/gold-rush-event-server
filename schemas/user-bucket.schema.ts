import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserBucketDocument = HydratedDocument<UserBucket>;

@Schema()
export class UserBucket {
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
  userId: string;

  @Prop({
    required: true,
  })
  bucketId: string;

  @Prop({
    required: true,
  })
  goldNuggets: number;

  @Prop({
    required: true,
  })
  nuggetsClaimed: boolean;
}

export const UserBucketSchema = SchemaFactory.createForClass(UserBucket);
