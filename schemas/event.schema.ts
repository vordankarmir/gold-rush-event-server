import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EVENT_STATE } from '../src/event/types';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
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
  state: EVENT_STATE;

  @Prop({
    required: true,
  })
  startDate: number;

  @Prop({
    required: true,
  })
  endDate: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
