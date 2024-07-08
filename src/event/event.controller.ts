import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Body,
  Response,
} from '@nestjs/common';
import { EventService } from './event.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Request as Req, Response as Res } from 'express';

@UseGuards(JwtGuard)
@Controller('')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('/events/:id')
  async findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Post('/events/:id/report-score')
  async createBucketOrReportScore(
    @Param('id') eventId: string,
    @Request() req: Req,
    @Body('score') score: number,
  ) {
    const userId = req.user['_id'];
    return this.eventService.createBucketOrReportScore(userId, eventId, score);
  }

  @Get('/ongoing-event')
  async findOnGoingEvent() {
    return this.eventService.findOngoingEvent();
  }

  @Post('/events/:id/claim-rewards')
  async claimRewards(
    @Param('id') eventId: string,
    @Request() req: Req,
    @Response() res: Res,
  ) {
    const userId = req.user['_id'];
    await this.eventService.claimRewards(userId, eventId);
    return res.send('Rewards claimed');
  }
}
