import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventSchema } from '../../schemas/event.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { UserBucket, UserBucketSchema } from '../../schemas/user-bucket.schema';
import { Bucket, BucketSchema } from '../../schemas/bucket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: UserBucket.name, schema: UserBucketSchema },
      { name: Bucket.name, schema: BucketSchema },
    ]),
    UserModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
