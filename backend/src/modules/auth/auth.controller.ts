// third party imports
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, response } from 'express';

// inner imports
import { CreateOrUpdateUserDto, LoginUserDto } from 'src/dto';
import { UserService } from '../user/user.service';
import { _getParsedUserBody, _getParsedUserResponsePayload } from 'src/helpers/parser';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

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
  @UseGuards(AuthGuard)
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
