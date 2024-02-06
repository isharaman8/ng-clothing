// third party imports
import { Response } from 'express';
import { Body, Controller, Patch, Post, Res } from '@nestjs/common';

// inner imports
import { UserService } from './user.service';
import { CreateOrUpdateUserDto } from 'src/dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('')
  async createUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: Response) {
    const { oldUser } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    let createdUser: any = await this.userService.createOrUpdateUser(payload, oldUser);

    return response.status(201).send({ user: this.userService.getParsedUserResponsePayload(createdUser) });
  }

  @Patch(':user_id')
  async updateUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: Response) {
    const { oldUser } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    let createdUser: any = await this.userService.createOrUpdateUser(payload, oldUser);

    return response.status(200).send({ user: this.userService.getParsedUserResponsePayload(createdUser) });
  }
}
