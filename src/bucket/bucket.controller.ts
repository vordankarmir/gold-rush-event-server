import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('buckets')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Get('/:id/leaderboard')
  async getLeaderboard(@Param('id') bucketId: string) {
    return this.bucketService.getLeaderboard(bucketId);
  }
}
