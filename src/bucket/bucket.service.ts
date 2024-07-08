import { Injectable } from '@nestjs/common';
import { Bucket } from '../../schemas/bucket.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';

@Injectable()
export class BucketService {
  constructor(@InjectModel(Bucket.name) private bucketModel: Model<Bucket>) {}

  async create(createBucketDto: CreateBucketDto): Promise<Bucket | null> {
    const createdUser = new this.bucketModel(createBucketDto);
    return createdUser.save();
  }

  async update(
    id: string,
    updateBucketDto: UpdateBucketDto,
  ): Promise<Bucket | null> {
    const updatedBucket = await this.bucketModel.findByIdAndUpdate(
      {
        _id: id,
      },
      updateBucketDto,
      {
        returnOriginal: false,
      },
    );

    return updatedBucket;
  }

  async getLeaderboard(bucketId: string) {
    const agg = await this.bucketModel
      .aggregate([
        {
          $match: {
            _id: {
              $eq: bucketId,
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
          $lookup: {
            from: 'users',
            localField: 'userBucket.userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: '$user._id',
            rank: '$user.rank',
            goldNuggets: '$userBucket.goldNuggets',
          },
        },
        { $sort: { goldNuggets: -1 } },
      ])
      .exec();

    return agg;
  }

  async findByEventId(eventId: string) {
    return this.bucketModel.find({ eventId });
  }
}
