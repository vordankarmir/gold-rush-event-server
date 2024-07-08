import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  providers: [CronJobService],
})
export class CronJobModule {}
