// third party imports
import {
  Get,
  Req,
  Res,
  Body,
  Post,
  Controller,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

// inner imports
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateOrUpdateUserDto, LoginUserDto } from 'src/dto';
import { _getParsedUserBody, _getParsedUserResponsePayload } from 'src/helpers/parser';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signUpUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: Response) {
    const { oldUser } = response.locals;
    const payload = _getParsedUserBody(user);

    let userToken: string;
    let createdUser: CreateOrUpdateUserDto;

    try {
      createdUser = await this.userService.createOrUpdateUser(payload, oldUser);
      userToken = await this.authService.getAuthToken(createdUser);
    } catch (error) {
      console.log('UPDATE USER ERROR', error);

      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ user: _getParsedUserResponsePayload(createdUser), auth_token: userToken });
  }

  @Post('login')
  async loginUser(@Body('user') _user: LoginUserDto, @Res() response: Response) {
    const { oldUser } = response.locals;

    let userToken: string;

    try {
      userToken = await this.authService.getAuthToken(oldUser);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ user: _getParsedUserResponsePayload(oldUser), auth_token: userToken });
  }

  @Get('/profile')
  async getProfile(@Req() request: any, @Res() response: Response) {
    let user: Array<CreateOrUpdateUserDto> | CreateOrUpdateUserDto;

    try {
      user = await this.userService.getAllUsers({ userId: request.user.uid });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!user.length) {
      throw new UnauthorizedException('user not found');
    }

    user = user[0];

    return response.status(200).send({ user: _getParsedUserResponsePayload(user) });
  }
}
