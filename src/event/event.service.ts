import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from '../../schemas/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EVENT_STATE } from './types';
import { UserService } from '../user/user.service';
import { UserBucket } from '../../schemas/user-bucket.schema';
import { Bucket } from '../../schemas/bucket.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(UserBucket.name) private userBucketModel: Model<UserBucket>,
    @InjectModel(Bucket.name) private bucketModel: Model<Bucket>,
    private userService: UserService,
  ) {}

  async create() {
    const currentDate = new Date();

    const eventModel = new this.eventModel({
      startDate: Date.now(),
      endDate: currentDate.setDate(
        currentDate.getMinutes() + parseInt(process.env.EVENT_DURATION, 10),
      ),
      state: EVENT_STATE.ONGOING,
    });

    return eventModel.save();
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findOngoingEvent(): Promise<Event | null> {
    return this.eventModel
      .findOne({ state: EVENT_STATE.ONGOING })
      .select(['_id', 'startDate', 'endDate', 'state'])
      .exec();
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.findOne(id);

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      {
        _id: id,
      },
      updateEventDto,
      {
        returnOriginal: false,
      },
    );

    return updatedEvent;
  }

  async claimRewards(userId: string, eventId: string) {
    const [user, event] = await Promise.all([
      this.userService.findOne(userId),
      this.findOne(eventId),
    ]);

    if (event.state === EVENT_STATE.ONGOING) {
      throw new ConflictException("Cant't claim rewards");
    }

    const [userBucket] = await this.bucketModel
      .aggregate([
        {
          $match: {
            eventId: {
              $eq: eventId,
            },
          },
        },
        {
          $lookup: {
            from: 'userbuckets',
            localField: '_id',
            foreignField: 'bucketId',
            as: 'userBucket',
            pipeline: [{ $match: { userId: { $eq: userId } } }],
          },
        },
        { $unwind: '$userBucket' },
        {
          $project: {
            _id: '$userBucket._id',
          },
        },
      ])
      .exec();

    const reward =
      user.silverNuggets + parseInt(process.env.REWARD_AMOUNT, 10) - user.rank;

    await Promise.all([
      this.userService.update(userId, {
        silverNuggets: reward,
      }),
      this.userBucketModel.findByIdAndUpdate(
        { _id: userBucket._id },
        { nuggetsClaimed: true },
        {
          returnOriginal: false,
        },
      ),
    ]);
  }

  async getUserBucketData(eventId: string) {
    const agg = await this.bucketModel
      .aggregate([
        {
          $match: {
            eventId: {
              $eq: eventId,
            },
          },
        },
        {
          $lookup: {
            from: 'userbuckets',
            localField: '_id',
            foreignField: 'bucketId',
            as: 'userBucket',
          },
        },
        { $unwind: '$userBucket' },
        {
          $project: {
            _id: true,
            whaleCount: true,
            dolphinCount: true,
            fishCount: true,
            userBuckets: [
              {
                _id: '$userBucket._id',
                userId: '$userBucket.userId',
                goldNuggets: '$userBucket.goldNuggets',
              },
            ],
          },
        },
      ])
      .exec();

    return agg;
  }
}
