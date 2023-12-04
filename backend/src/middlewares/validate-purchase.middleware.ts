// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { Purchase } from 'src/schemas/purchase.schema';
import { ProductService } from 'src/modules/product/product.service';
import { CRequest, CResponse, PurchaseProduct } from 'src/interfaces';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';

@Injectable()
export class ValidatePurchaseMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private productService: ProductService,
  ) {}

  async validateProducts(productArray: Array<PurchaseProduct>) {
    const productUids: Array<string> = _.map(productArray, (product) => product.uid);
    const query = _getParsedQuery({ uid: productUids });

    let products = [];

    try {
      if (productUids.length) {
        products = await this.productService.getAllProducts(query);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    for (const uid of productUids) {
      const reqdProduct = _.find(products, (product) => product.uid === uid);

      if (!reqdProduct) {
        throw new BadRequestException('product not found');
      }
    }
  }

  validateVerifyRequest(method: string, originalUrl: string, oldPurchase: any = {}) {
    if (method.toUpperCase() === 'PATCH' && originalUrl.endsWith('/verify')) {
      if (!oldPurchase) {
        throw new BadRequestException('invalid verify request');
      }
    }
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    // attach to response
    const { user = {} } = req;
    const params = _getParsedParams(req.params);
    const findQuery = _.filter([{ uid: params.purchaseId }, { user_id: user.uid }], _notEmpty);

    let oldPurchase: any;

    try {
      if (params.purchaseId) {
        oldPurchase = await this.purchaseModel.findOne({ $and: findQuery });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.validateProducts(parseArray(oldPurchase?.products, []));

    this.validateVerifyRequest(req.method, req.originalUrl, oldPurchase);

    // for post request
    if (!oldPurchase) {
      oldPurchase = new this.purchaseModel();
    }

    // attach to res.locals
    res.locals.oldPurchase = oldPurchase;

    next();
  }
}
