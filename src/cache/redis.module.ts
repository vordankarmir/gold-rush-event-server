import { Module } from '@nestjs/common';
import { redisProvider } from './redis.provider';
import { RedisService } from './redis.service';
import { RedisRepository } from './redis.repository';

@Module({
  providers: [redisProvider, RedisService, RedisRepository],
  exports: [RedisService],
})
export class RedisModule {}
