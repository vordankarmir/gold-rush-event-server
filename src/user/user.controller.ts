import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';
import { UpdateUserDto, updateUserDTOSchema } from './dto/update-user.dto';
import * as Joi from 'joi';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(updateUserDTOSchema))
  async update(
    @Param('id', new JoiValidationPipe(Joi.string().uuid())) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
