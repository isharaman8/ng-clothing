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

// inner imports
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CRequest, CResponse } from 'src/interfaces';
import { _getParsedQuery } from 'src/helpers/parser';
import { CreateOrUpdateUserDto, LoginUserDto } from 'src/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signUpUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: CResponse) {
    const { oldUser } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    let userToken: string;
    let createdUser: CreateOrUpdateUserDto;

    createdUser = await this.userService.createOrUpdateUser(payload, oldUser);
    userToken = await this.authService.getAuthToken(createdUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([createdUser]);

    createdUser = tempUser[0];

    // parse response
    createdUser = this.userService.getParsedUserResponsePayload(createdUser);

    return response.status(200).send({ user: createdUser, auth_token: userToken });
  }

  @Post('login')
  async loginUser(@Body('user') _user: LoginUserDto, @Res() response: CResponse) {
    let userToken: string;
    let { oldUser } = response.locals;

    userToken = await this.authService.getAuthToken(oldUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([oldUser]);

    oldUser = tempUser[0];

    // parse response
    oldUser = this.userService.getParsedUserResponsePayload(oldUser);

    return response.status(200).send({ user: oldUser, auth_token: userToken });
  }

  @Get('/profile')
  async getProfile(@Req() request: CRequest, @Res() response: CResponse) {
    const parsedQuery = _getParsedQuery(request.query);

    let user: Array<CreateOrUpdateUserDto> | CreateOrUpdateUserDto;

    // add props in query
    parsedQuery.uid = request.user.uid;

    user = await this.userService.getAllUsers(parsedQuery);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl(user);

    user = tempUser;

    if (!user.length) {
      throw new UnauthorizedException('user not found');
    }

    // parse response
    user = this.userService.getParsedUserResponsePayload(user[0]);

    return response.status(200).send({ user });
  }
}
