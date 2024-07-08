import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './redis.repository';
import { LeaderboardInstance } from '../../common/types/leaderboard';

const fifteenSecondsInMilliseconds = 15;

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}

  async getLeaderboard() {
    const leaderboard = await this.redisRepository.get('leaderboard');
    return JSON.parse(leaderboard);
  }

  async saveLeaderboard(leaderboard: LeaderboardInstance[]) {
    await this.redisRepository.set(
      'leaderboard',
      JSON.stringify(leaderboard),
      fifteenSecondsInMilliseconds,
    );
  }
}
