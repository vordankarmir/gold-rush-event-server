import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import Joi from 'joi';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';

@UseGuards(JwtGuard)
@Controller('buckets')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Get('/:id/leaderboard')
  async getLeaderboard(
    @Param('id', new JoiValidationPipe(Joi.string().uuid())) bucketId: string,
  ) {
    return this.bucketService.getLeaderboard(bucketId);
  }
}
