// third party imports
import * as _ from 'lodash';
import { Response } from 'express';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils';
import { UserService } from './user.service';
import { CRequest, CResponse } from 'src/interfaces';
import { UserAddressService } from './user-address.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { CreateOrUpdateUserAddressDto, CreateOrUpdateUserDto } from 'src/dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private userAddressService: UserAddressService,
  ) {}

  // internal helpers
  private async createOrUpdateUserHandler(user: any, response: CResponse, statusCode: number) {
    const { oldUser, uploads } = response.locals;
    const payload = this.userService.getParsedUserBody(user);

    let createdUser: any = await this.userService.createOrUpdateUser(payload, oldUser);

    // get updated profile picture url
    const tempUser = await this.userService.getUpdatedProfilePictureUrl([createdUser], uploads);

    createdUser = tempUser[0];

    return response.status(statusCode).send({ user: this.userService.getParsedUserResponsePayload(createdUser) });
  }

  private async createOrUpdateUserAddressHandler(user: any, response: CResponse, statusCode: number) {
    const { oldAddress, address } = response.locals;

    let createdOrUpdatedAddress = await this.userAddressService.createOrUpdateUserAddress(address, oldAddress, user);
    createdOrUpdatedAddress = this.userAddressService.getParsedUserAddressResponsePayload(createdOrUpdatedAddress);

    return response.status(statusCode).send({ address: createdOrUpdatedAddress });
  }

  // main controllers
  @Post('')
  async createUser(@Body('user') user: CreateOrUpdateUserDto, @Res() response: Response) {
    await this.createOrUpdateUserHandler(user, response, 201);
  }

  @Patch(':user_id')
  async updateUser(@Body('user') user: Partial<CreateOrUpdateUserDto>, @Res() response: Response) {
    await this.createOrUpdateUserHandler(user, response, 200);
  }

  @Get('/address')
  async getUserAddresses(@Query() query: any, @Req() request: CRequest, @Res() response: CResponse) {
    const parsedQuery = _getParsedQuery(query);
    parsedQuery['userId'] = request.user.uid;

    let userAddresses = await this.userAddressService.getAllUserAddresses(parsedQuery);
    userAddresses = _.map(parseArray(userAddresses, []), this.userAddressService.getParsedUserAddressResponsePayload);

    return response.status(200).send({ addresses: userAddresses });
  }

  @Post('/address')
  async createUserAddress(
    @Body('address') _address: CreateOrUpdateUserAddressDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateUserAddressHandler(request.user, response, 201);
  }

  @Patch('/address/:user_address_uid')
  async updateUserAddress(
    @Body('address') _address: Partial<CreateOrUpdateUserAddressDto>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateUserAddressHandler(request.user, response, 200);
  }

  @Delete('/address/:user_address_uid')
  async deleteUserAddress(@Param() params: any, @Res() response: CResponse) {
    const parsedParams = _getParsedParams(params);

    await this.userAddressService.deleteUserAddress(parsedParams.userAddressId);

    return response.status(204).send({});
  }
}
