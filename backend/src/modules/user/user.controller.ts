// third party imports
import { Response } from 'express';
import {
  Controller,
  InternalServerErrorException,
  Patch,
  Post,
  Res,
} from '@nestjs/common';

// inner imports
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('')
  @Patch(':user_id')
  async createOrUpdateUser(@Res() response: Response) {
    const { payload, oldUser } = response.locals;

    let createdUser: any;

    try {
      createdUser = await this.userService.createOrUpdateUser(payload, oldUser);
    } catch (error) {
      console.log('CREATE OR UPDATE USER ERROR', error);

      throw new InternalServerErrorException(error.message);
    }

    return response.status(201).send({ user: createdUser });
  }
}
