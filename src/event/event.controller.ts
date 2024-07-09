import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { EventService } from './event.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Request as Req, Response as Res } from 'express';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';
import Joi from 'joi';

@UseGuards(JwtGuard)
@Controller('')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('/events/:id')
  async findOne(
    @Param('id', new JoiValidationPipe(Joi.string().uuid())) id: string,
  ) {
    return this.eventService.findOne(id);
  }

  @Get('/ongoing-event')
  async findOnGoingEvent() {
    return this.eventService.findOngoingEvent();
  }

  @Post('/events/:id/claim-rewards')
  async claimRewards(
    @Param('id', new JoiValidationPipe(Joi.string().uuid())) eventId: string,
    @Request() req: Req,
    @Response() res: Res,
  ) {
    const userId = req.user['_id'];
    await this.eventService.claimRewards(userId, eventId);
    return res.send('Rewards claimed');
  }
}
