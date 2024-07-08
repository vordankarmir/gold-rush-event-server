import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClient } from './redis.provider';

@Injectable()
export class RedisRepository implements OnModuleDestroy {
  public constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClient,
  ) {}

  onModuleDestroy(): void {
    this.client.disconnect();
  }

  async set(
    key: string,
    value: string,
    ttlInMilliseconds: number,
  ): Promise<void> {
    await this.client.set(key, value, 'EX', ttlInMilliseconds);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setWithExpiry(
    key: string,
    value: string,
    ttlInMilliseconds: number,
  ): Promise<void> {
    await this.client.set(key, value, 'EX', ttlInMilliseconds);
  }
}
