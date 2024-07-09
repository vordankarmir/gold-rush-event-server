import {
  Controller,
  Param,
  Post,
  UseGuards,
  Request,
  Body,
  UsePipes,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Request as Req } from 'express';
import { ScoreService } from './score.service';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';
import * as Joi from 'joi';
import { CreateScoreDto, createScoreSchema } from './dto/create-score.dto';

@UseGuards(JwtGuard)
@Controller('')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('/events/:id/report-score')
  @UsePipes(new JoiValidationPipe(createScoreSchema))
  async createBucketOrReportScore(
    @Param('id', new JoiValidationPipe(Joi.string().uuid())) eventId: string,
    @Request() req: Req,
    @Body('score') createScoreDto: CreateScoreDto,
  ) {
    const userId = req.user['_id'];
    return this.scoreService.createBucketOrReportScore(
      userId,
      eventId,
      createScoreDto.score,
    );
  }
}
