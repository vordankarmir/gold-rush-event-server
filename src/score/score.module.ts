import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { BucketModule } from '../bucket/bucket.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBucket, UserBucketSchema } from '../../schemas/user-bucket.schema';
import { CronJobModule } from '../schedules/cron-job.module';
import { ScoreController } from './score.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBucket.name, schema: UserBucketSchema },
    ]),
    EventModule,
    UserModule,
    BucketModule,
    CronJobModule,
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
