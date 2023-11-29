// third party imports
import { Response } from 'express';
import {
  Body,
  Controller,
  InternalServerErrorException,
  Patch,
  Post,
  Res,
} from '@nestjs/common';

// inner imports
import { UserService } from './user.service';
import { CreateOrUpdateUserDto } from 'src/dto';
import { _getParsedUserBody } from 'src/helpers/parser';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('')
  async createUser(
    @Body('user') user: CreateOrUpdateUserDto,
    @Res() response: Response,
  ) {
    const { oldUser } = response.locals;
    const payload = _getParsedUserBody(user);

    let createdUser: any;

    try {
      createdUser = await this.userService.createOrUpdateUser(payload, oldUser);
    } catch (error) {
      console.log('CREATE USER ERROR', error);

      throw new InternalServerErrorException(error.message);
    }

    return response.status(201).send({ user: createdUser });
  }

  @Patch(':user_id')
  async updateUser(
    @Body('user') user: CreateOrUpdateUserDto,
    @Res() response: Response,
  ) {
    const { oldUser } = response.locals;
    const payload = _getParsedUserBody(user);

    let createdUser: any;

    try {
      createdUser = await this.userService.createOrUpdateUser(payload, oldUser);
    } catch (error) {
      console.log('UPDATE USER ERROR', error);

      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ user: createdUser });
  }
}
