import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { EVENT_STATE } from '../types';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  state?: EVENT_STATE;
}
