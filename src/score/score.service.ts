import { ConflictException } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { EVENT_STATE } from '../event/types';
import { UserService } from '../user/user.service';
import { BucketService } from '../bucket/bucket.service';
import { InjectModel } from '@nestjs/mongoose';
import { UserBucket } from '../../schemas/user-bucket.schema';
import { Model } from 'mongoose';
import { CronJobService } from '../schedules/cron-job.service';

export class ScoreService {
  constructor(
    @InjectModel(UserBucket.name) private userBucketModel: Model<UserBucket>,
    private userService: UserService,
    private eventService: EventService,
    private bucketService: BucketService,
    private cronJobService: CronJobService,
  ) {}

  async createBucketOrReportScore(userId: string, eventId, score: number) {
    const [event, user] = await Promise.all([
      this.eventService.findOne(eventId),
      this.userService.findOne(userId),
    ]);

    const userTypeCount = `${user.type.toLowerCase()}Count`;

    if (event.state === EVENT_STATE.ENDED) {
      throw new ConflictException('Event is ended');
    }

    const buckets = await this.eventService.getUserBucketData(event._id);

    // If there are no buckets for the ongoing event yet, create one and save the user score
    if (!buckets || buckets.length === 0) {
      const createdBucket = await this.bucketService.create({
        eventId: event._id,
        [userTypeCount]: 1,
      });

      const createUserBucket = new this.userBucketModel({
        userId,
        bucketId: createdBucket._id,
        goldNuggets: score,
        nuggetsClaimed: false,
      });

      return createUserBucket.save();
    }

    const bucketUserIsIn = buckets.find((b) =>
      b.userBuckets.some((uB) => uB.userId === userId),
    );

    // update score if user already is in bucket
    if (bucketUserIsIn) {
      const userBucket = bucketUserIsIn.userBuckets.find(
        (uB) => uB.userId === userId,
      );
      const updatedBucket = await this.userBucketModel.findByIdAndUpdate(
        {
          _id: userBucket._id,
        },
        {
          goldNuggets: score,
        },
        {
          returnOriginal: false,
        },
      );

      this.cronJobService.setLeaderboard(bucketUserIsIn._id);

      return updatedBucket;
    }

    let bucketToJoin = buckets.find(
      (b) => b[userTypeCount] < parseInt(process.env[`${user.type}_LIMIT`], 10),
    );

    if (!bucketToJoin) {
      bucketToJoin = await this.bucketService.create({
        eventId: event._id,
        [userTypeCount]: 1,
      });
    } else {
      const count = bucketToJoin[userTypeCount];
      this.bucketService.update(bucketToJoin._id, {
        [userTypeCount]: count + 1,
      });
    }

    const createUserBucket = new this.userBucketModel({
      userId,
      bucketId: bucketToJoin._id,
      goldNuggets: score,
      nuggetsClaimed: false,
    });

    return createUserBucket.save();
  }
}
