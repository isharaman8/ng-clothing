// third party imports
import * as _ from 'lodash';
import { Get, Req, Res, Body, Post, Controller, UnauthorizedException, Patch } from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CRequest, CResponse } from 'src/interfaces';
import { _getParsedQuery } from 'src/helpers/parser';
import { CreateOrUpdateUserDto, LoginUserDto } from 'src/dto';
import { UserAddressService } from '../user/user-address.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private userAddressService: UserAddressService,
  ) {}

  // internal helpers
  private async signUpOrUpdateUser(response: CResponse, statusCode: number) {
    const { oldUser, user, uploads } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    let userToken: string;
    let createdOrUpdatedUser: CreateOrUpdateUserDto;

    createdOrUpdatedUser = await this.userService.createOrUpdateUser(payload, oldUser);
    userToken = await this.authService.getAuthToken(createdOrUpdatedUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([createdOrUpdatedUser], uploads);

    createdOrUpdatedUser = tempUser[0];

    // parse response
    createdOrUpdatedUser = this.userService.getParsedUserResponsePayload(createdOrUpdatedUser);

    return response.status(statusCode).send({ user: createdOrUpdatedUser, auth_token: userToken });
  }

  @Post('signup')
  async signUpUser(@Body('user') _user: CreateOrUpdateUserDto, @Res() response: CResponse) {
    await this.signUpOrUpdateUser(response, 200);
  }

  @Patch('/profile/update')
  async updateProfile(@Body('user') _user: Partial<CreateOrUpdateUserDto>, @Res() response: CResponse) {
    await this.signUpOrUpdateUser(response, 200);
  }

  @Post('login')
  async loginUser(@Body('user') _user: LoginUserDto, @Res() response: CResponse) {
    let userToken: string;
    let { oldUser, uploads } = response.locals;

    userToken = await this.authService.getAuthToken(oldUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([oldUser], uploads);

    oldUser = tempUser[0];

    // parse response
    oldUser = this.userService.getParsedUserResponsePayload(oldUser);

    return response.status(200).send({ user: oldUser, auth_token: userToken });
  }

  @Get('/profile')
  async getProfile(@Req() request: CRequest, @Res() response: CResponse) {
    const parsedQuery = _getParsedQuery(request.query);

    let user: any;

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
    user['user_addresses'] = _.map(
      parseArray(user.user_addresses, []),
      this.userAddressService.getParsedUserAddressResponsePayload,
    );

    return response.status(200).send({ user });
  }
}
