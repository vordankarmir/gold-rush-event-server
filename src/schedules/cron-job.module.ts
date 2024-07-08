import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { EventModule } from '../event/event.module';
import { RedisModule } from '../cache/redis.module';
import { BucketModule } from '../bucket/bucket.module';

@Module({
  imports: [EventModule, BucketModule, RedisModule],
  exports: [CronJobService],
  providers: [CronJobService],
})
export class CronJobModule {}
