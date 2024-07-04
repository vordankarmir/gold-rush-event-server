import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type BucketDocument = HydratedDocument<Bucket>;

@Schema()
export class Bucket {
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
  eventId: string;
}

export const BucketSchema = SchemaFactory.createForClass(Bucket);
