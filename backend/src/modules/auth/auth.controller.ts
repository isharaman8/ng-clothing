// third party imports
import {
  Get,
  Req,
  Res,
  Body,
  Post,
  Patch,
  Controller,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as _ from 'lodash';

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
  private async signUpOrUpdateUser(response: CResponse, statusCode: number, roles: Array<string> = []) {
    const { oldUser, user, uploads } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    // set roles in payload
    if (!_.isEmpty(roles)) {
      _.set(payload, 'roles', roles);
    }

    let userToken: string;
    let createdOrUpdatedUser: CreateOrUpdateUserDto;

    createdOrUpdatedUser = await this.userService.createOrUpdateUser(payload, oldUser);
    userToken = await this.authService.getAuthToken(createdOrUpdatedUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([createdOrUpdatedUser], uploads);

    createdOrUpdatedUser = tempUser[0];

    // parse response
    createdOrUpdatedUser = this.userService.getParsedUserResponsePayload(createdOrUpdatedUser);

    return { user: createdOrUpdatedUser, auth_token: userToken };
  }

  private async handleLogin(response: CResponse) {
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

  @Post('signup')
  async signUpUser(@Body('user') _user: CreateOrUpdateUserDto, @Res() response: CResponse) {
    const normalUserRoles = ['user'];

    const responseData = await this.signUpOrUpdateUser(response, 200, normalUserRoles);

    // send verification email
    // await this.authService.sendVerificationEmail(responseData);

    return response.status(201).send(responseData);
  }

  @Post('admin/signup')
  async adminSignUpUser(@Body('user') _user: CreateOrUpdateUserDto, @Res() response: CResponse) {
    const adminUserRoles = ['user', 'admin'];

    const responseData = await this.signUpOrUpdateUser(response, 200, adminUserRoles);

    // send verification email
    // await this.authService.sendVerificationEmail(responseData);

    return response.status(201).send(responseData);
  }

  @Patch('/profile/update')
  async updateProfile(@Body('user') _user: Partial<CreateOrUpdateUserDto>, @Res() response: CResponse) {
    const responseData = await this.signUpOrUpdateUser(response, 200);

    return response.status(200).send(responseData);
  }

  @Post('login')
  async loginUser(@Body('user') _user: LoginUserDto, @Res() response: CResponse) {
    await this.handleLogin(response);
  }

  @Post('admin/login')
  async adminLoginUser(@Body('user') _user: LoginUserDto, @Res() response: CResponse) {
    await this.handleLogin(response);
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

  @Get('/verify')
  async verifyToken(@Req() request: CRequest, @Res() response: CResponse) {
    const query = _getParsedQuery(request.query);

    if (_.isEmpty(query.token)) {
      throw new BadRequestException('request token required for verification');
    }

    const user = await this.authService.getPayloadFromToken(query.token);

    if (!user?.email) {
      throw new BadRequestException('user not found');
    }

    // populate query
    query['email'] = user.email;
    query['username'] = user.username;

    const checkUserExists = await this.userService.getAllUsers(query);

    if (_.isEmpty(checkUserExists)) {
      throw new BadRequestException('user not found');
    }

    await this.userService.createOrUpdateUser({ email: user.email, is_verified: true }, checkUserExists[0]);

    return response.status(200).send({ message: 'user verified successfully' });
  }

  @Post('/send-verification-email')
  async sendVerificationEmail(@Req() request: CRequest, @Res() response: CResponse) {
    const userToken = await this.authService.getAuthToken(request.user);

    await this.authService.sendVerificationEmail({ user: request.user, auth_token: userToken });

    return response.status(200).send({ message: 'mail sent successfully' });
  }
}
