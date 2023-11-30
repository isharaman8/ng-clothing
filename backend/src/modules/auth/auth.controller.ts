// third party imports
import { Body, Controller, InternalServerErrorException, Post, Res } from '@nestjs/common';
import { Response } from 'express';

// inner imports
import { CreateOrUpdateUserDto, LoginUserDto } from 'src/dto';
import { UserService } from '../user/user.service';
import { _getParsedUserBody, _getParsedUserResponsePayload } from 'src/helpers/parser';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('signup')
  async signUpUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: Response) {
    const { oldUser } = response.locals;
    const payload = _getParsedUserBody(user);

    let createdUser: any;

    try {
      createdUser = await this.userService.createOrUpdateUser(payload, oldUser);
    } catch (error) {
      console.log('UPDATE USER ERROR', error);

      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ user: _getParsedUserResponsePayload(createdUser) });
  }

  @Post('login')
  async loginUser(@Body('user') _user: LoginUserDto, @Res() response: Response) {
    const { oldUser } = response.locals;

    return response.status(200).send({ user: _getParsedUserResponsePayload(oldUser) });
  }
}
