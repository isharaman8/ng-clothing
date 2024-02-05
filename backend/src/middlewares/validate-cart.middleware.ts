// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';

// inner imports
import { Cart } from 'src/schemas/cart.schema';
import { CreateOrUpdateCartDto } from 'src/dto';
import { _notEmpty, parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';
import { CartService } from 'src/modules/cart/cart.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { SharedValidatorService } from 'src/modules/shared/shared-validator.service';

@Injectable()
export class ValidateCartMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private cartService: CartService,
    private sharedValidatorService: SharedValidatorService,
  ) {}

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    // attach to response
    const {
      user = {},
      body: { cart = {} },
    } = req;
    const parsedCart = this.cartService.getParsedCartPayload(cart);
    const findQuery = _.filter([{ user_id: user.uid }], _notEmpty);

    let oldCart: CreateOrUpdateCartDto = new this.cartModel();
    let tempCart: any;

    try {
      tempCart = await this.cartModel.findOne({ $and: findQuery });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!_.isEmpty(tempCart)) {
      oldCart = tempCart;
    }

    // attach validated products
    parsedCart.products = await this.sharedValidatorService.validateAndParseProducts(
      parseArray(parsedCart.products, []),
    );

    // attach to res.locals
    res.locals.oldCart = oldCart;
    res.locals.cart = parsedCart;

    next();
  }
}
