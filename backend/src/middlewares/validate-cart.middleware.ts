// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NestMiddleware } from '@nestjs/common';

// inner imports
import { _notEmpty } from 'src/utils';
import { Cart } from 'src/schemas/cart.schema';
import { CreateOrUpdateCartDto } from 'src/dto';
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

    let oldCart: CreateOrUpdateCartDto = new this.cartModel();

    const tempCart = await this.cartService.getUserCart(user);

    if (!_.isEmpty(tempCart)) {
      oldCart = tempCart;
    }

    // attach validated products
    parsedCart.products = await this.sharedValidatorService.validateAndParseProducts(parsedCart, oldCart.products);

    // attach to res.locals
    res.locals.oldCart = oldCart;
    res.locals.cart = parsedCart;

    next();
  }
}
