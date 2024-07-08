import { Module } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { BucketController } from './bucket.controller';
import { UserModule } from '../user/user.module';
import { Bucket, BucketSchema } from '../../schemas/bucket.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '../cache/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bucket.name, schema: BucketSchema }]),
    UserModule,
    RedisModule,
  ],
  controllers: [BucketController],
  providers: [BucketService],
  exports: [BucketService],
})
export class BucketModule {}
