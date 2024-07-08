import {
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Request as Req } from 'express';
import { ScoreService } from './score.service';

@UseGuards(JwtGuard)
@Controller('')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('/events/:id/report-score')
  async createBucketOrReportScore(
    @Param('id') eventId: string,
    @Request() req: Req,
    @Body('score') score: number,
  ) {
    const userId = req.user['_id'];
    return this.scoreService.createBucketOrReportScore(userId, eventId, score);
  }
}
