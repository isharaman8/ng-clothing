// third party imports
import * as _ from 'lodash';
import { NextFunction } from 'express';
import { byAlpha2 } from 'iso-country-codes';
import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';
import { CreateOrUpdateUserAddressDto } from 'src/dto';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { UserAddressService } from 'src/modules/user/user-address.service';

@Injectable()
export class ValidateUserAddressMiddleware implements NestMiddleware {
  constructor(private userAddressService: UserAddressService) {}

  private validatePatchAndDeleteRequest(method: string, oldAddress: CreateOrUpdateUserAddressDto) {
    if (_.includes(['PATCH', 'DELETE'], method.toUpperCase()) && _.isEmpty(oldAddress)) {
      throw new NotFoundException('user address not found');
    }
  }

  private validatePostRequest(method: string, address: Partial<CreateOrUpdateUserAddressDto>) {
    if (_.includes(['POST'], method.toUpperCase()) === false) {
      return;
    }

    if (!address.user_id) {
      throw new InternalServerErrorException('user_id required');
    }
  }

  private validateCountryCode(method: string, address: Partial<CreateOrUpdateUserAddressDto>) {
    if (_.includes(['POST', 'PATCH'], method.toUpperCase())) {
      if (address.country && !byAlpha2[address.country]) {
        throw new BadRequestException('invalid country code, please provide alpha2 iso standard country code');
      }
    }
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { address = {} },
    } = req;
    const params = _getParsedParams(req.params);
    const findQuery = _getParsedQuery({ uid: params.userAddressId, user_id: user.uid });
    const parsedAddress = this.userAddressService.getParsedUserAddressBody(address, user);
    findQuery['active'] = null;

    let oldAddress: any;

    this.validatePostRequest(req.method, parsedAddress);
    this.validateCountryCode(req.method, parsedAddress);

    if (params.userAddressId) {
      oldAddress = await this.userAddressService.getAllUserAddresses(findQuery);
      oldAddress = _.last(oldAddress);
    }

    this.validatePatchAndDeleteRequest(req.method, oldAddress);

    // attach to res.localas
    res.locals.oldAddress = oldAddress;
    res.locals.address = parsedAddress;

    next();
  }
}
