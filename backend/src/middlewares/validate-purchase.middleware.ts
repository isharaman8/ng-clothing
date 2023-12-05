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
import { ProductService } from 'src/modules/product/product.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { PurchaseService } from 'src/modules/purchase/purchase.service';

@Injectable()
export class ValidatePurchaseMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private productService: ProductService,
    private purchaseService: PurchaseService,
  ) {}

  async validateAndParseProducts(productUids: Array<string>) {
    const query = _getParsedQuery({ uid: productUids });
    const parsedProductArray = [];

    let products = [];

    try {
      if (productUids.length) {
        products = await this.productService.getAllProducts(query);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // validate if products exist
    for (const uid of productUids) {
      const reqdProduct = _.find(products, (product) => product.uid === uid);

      if (!reqdProduct) {
        throw new BadRequestException('product not found');
      }
    }

    // get parsed products
    for (const product of products) {
      parsedProductArray.push({
        uid: product.uid,
        name: product.name,
        price: product.price,
        images: product.images,
      });
    }

    return parsedProductArray;
  }

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
    const findQuery = _.filter([{ uid: params.purchaseId }, { user_id: user.uid }], _notEmpty);

    let oldPurchase: any;

    try {
      if (params.purchaseId) {
        oldPurchase = await this.purchaseModel.findOne({ $and: findQuery });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.validateVerifyRequest(req.method, req.originalUrl, oldPurchase);

    // attach validated products
    parsedPurchase.products = await this.validateAndParseProducts(parseArray(parsedPurchase.products, []));

    // for post request
    if (!oldPurchase) {
      oldPurchase = new this.purchaseModel();
    }

    // attach to res.locals
    res.locals.oldPurchase = oldPurchase;
    res.locals.purchase = parsedPurchase;

    next();
  }
}
