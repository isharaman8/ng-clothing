// third party imports
import { Response } from 'express';
import { Body, Controller, Patch, Post, Res } from '@nestjs/common';

// inner imports
import { UserService } from './user.service';
import { CreateOrUpdateUserDto } from 'src/dto';
import { CResponse } from 'src/interfaces';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // internal helpers
  private async createOrUpdateUserHandler(user: any, response: CResponse, statusCode: number) {
    const { oldUser } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    let createdUser: any = await this.userService.createOrUpdateUser(payload, oldUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([createdUser]);

    createdUser = tempUser[0];

    return response.status(201).send({ user: this.userService.getParsedUserResponsePayload(createdUser) });
  }

  @Post('')
  async createUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: Response) {
    await this.createOrUpdateUserHandler(user, response, 201);
  }

  @Patch(':user_id')
  async updateUser(@Body('user') user: Partial<CreateOrUpdateUserDto>, @Res() response: Response) {
    await this.createOrUpdateUserHandler(user, response, 200);
  }
}
