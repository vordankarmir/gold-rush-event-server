import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventService } from '../event/event.service';
import { EVENT_STATE } from '../event/types';

@Injectable()
export class CronJobService {
  constructor(private eventService: EventService) {}

  private readonly logger = new Logger(CronJobService.name);

  @Cron(process.env.EVENT_START_CRON_TIME ?? CronExpression.EVERY_MINUTE)
  async startEventCron() {
    const event = await this.eventService.create();
    this.logger.log(`Event ${event._id} started`);
    return;
  }

  @Cron(process.env.EVENT_END_CRON_TIME ?? CronExpression.EVERY_SECOND)
  async endEventCoron() {
    const currentDate = new Date();
    const event = await this.eventService.findOngoingEvent();
    this.logger.log('End event cron job started');

    if (event == null) return;
    this.logger.log(currentDate.getMinutes());
    this.logger.log(event.endDate.getMinutes());

    if (
      currentDate.getMinutes() - event.endDate.getMinutes() >=
      parseInt(process.env.EVENT_DURATION, 10)
    ) {
      await this.eventService.update(event._id, { state: EVENT_STATE.ENDED });
      this.logger.log(`Event ${event._id} ended`);
    }
    return;
  }
}
