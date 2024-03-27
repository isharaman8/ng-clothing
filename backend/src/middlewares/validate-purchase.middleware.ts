// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { Purchase } from 'src/schemas/purchase.schema';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { PurchaseService } from 'src/modules/purchase/purchase.service';
import { UserAddressService } from 'src/modules/user/user-address.service';
import { SharedValidatorService } from 'src/modules/shared/shared-validator.service';

@Injectable()
export class ValidatePurchaseMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private purchaseService: PurchaseService,
    private userAddressService: UserAddressService,
    private sharedValidatorService: SharedValidatorService,
  ) {}

  private validateVerifyRequest(method: string, originalUrl: string, oldPurchase: any) {
    if (method.toUpperCase() === 'PATCH' && originalUrl.endsWith('/verify')) {
      if (!oldPurchase) {
        throw new BadRequestException('invalid verify request');
      }
    }
  }

  private validateVerifiedUser(method: string, user: any) {
    if (method.toUpperCase() === 'POST' && !user.is_verified) {
      throw new UnauthorizedException('user not verified');
    }
  }

  private async validateAndGetAddresses(
    method: string,
    purchasePayload: Partial<CreateOrUpdatePurchaseDto>,
    user: any,
  ) {
    let userAddresses = [];

    if (method.toUpperCase() !== 'POST') {
      return userAddresses;
    }

    if (_.isEmpty(purchasePayload.address_id)) {
      throw new BadRequestException('address is required for purchase');
    }

    const findAddressQuery = _getParsedQuery({ uid: purchasePayload.address_id, user_id: user.uid });

    userAddresses = await this.userAddressService.getAllUserAddresses(findAddressQuery);

    if (_.isEmpty(userAddresses)) {
      throw new BadRequestException(`no user address found with given uid: ${purchasePayload.address_id}`);
    }

    return userAddresses;
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    // attach to response
    const {
      user = {},
      body: { purchase = {} },
    } = req;
    const params = _getParsedParams(req.params);
    const parsedPurchase = this.purchaseService.getParsedPurchaseBody(purchase, user);
    const findQuery = _getParsedQuery({ uid: params.purchaseId, user_id: user.uid });

    let oldPurchase: any,
      userAddresses: any = [];

    if (params.purchaseId) {
      const tempOldPurchase = await this.purchaseService.getAllPurchases(findQuery);

      oldPurchase = _.last(tempOldPurchase);
    }

    this.validateVerifiedUser(req.method, req.user);
    this.validateVerifyRequest(req.method, req.originalUrl, oldPurchase);

    userAddresses = await this.validateAndGetAddresses(req.method, parsedPurchase, req.user);
    userAddresses = _.map(userAddresses, this.userAddressService.getParsedUserAddressResponsePayload);

    // attach validated products
    parsedPurchase.products = await this.sharedValidatorService.validateAndParseProducts(
      parseArray(parsedPurchase.products, []),
    );

    // for post request
    if (!oldPurchase || req.method.toUpperCase() === 'POST') {
      oldPurchase = new this.purchaseModel();
    }

    // attach to res.locals
    res.locals.oldPurchase = oldPurchase;
    res.locals.purchase = parsedPurchase;
    res.locals.userAddresses = userAddresses;

    next();
  }
}
