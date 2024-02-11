// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';
import { Purchase } from 'src/schemas/purchase.schema';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { PurchaseService } from 'src/modules/purchase/purchase.service';
import { SharedValidatorService } from 'src/modules/shared/shared-validator.service';

@Injectable()
export class ValidatePurchaseMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private purchaseService: PurchaseService,
    private sharedValidatorService: SharedValidatorService,
  ) {}

  validateVerifyRequest(method: string, originalUrl: string, oldPurchase: any) {
    if (method.toUpperCase() === 'PATCH' && originalUrl.endsWith('/verify')) {
      if (!oldPurchase) {
        throw new BadRequestException('invalid verify request');
      }
    }
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

    let oldPurchase: any;

    if (params.purchaseId) {
      const tempOldPurchase = await this.purchaseService.getAllPurchases(findQuery);

      oldPurchase = _.last(tempOldPurchase);
    }

    this.validateVerifyRequest(req.method, req.originalUrl, oldPurchase);

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

    next();
  }
}
