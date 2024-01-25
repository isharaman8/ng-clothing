// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { parseNumber } from 'src/utils';
import { Cart } from 'src/schemas/cart.schema';
import { CreateOrUpdateCartDto, CreateOrUpdateUserDto } from 'src/dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async getUserCart(user: CreateOrUpdateUserDto) {
    let cart: any;

    try {
      cart = await this.cartModel.findOne({ user_id: user.uid });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return cart;
  }

  getParsedCartResponsePayload(payload: Partial<CreateOrUpdateCartDto>) {
    payload = JSON.parse(JSON.stringify(payload));

    const totalCartPrice = _.reduce(
      payload.products,
      (acc, curr) => acc + parseNumber(curr.price, 0) * parseNumber(curr.qty, 0),
      0,
    );

    payload['total_price'] = totalCartPrice;

    // delete unnecessary properties
    payload = _.omit(payload, ['$setOnInsert', '_id', '__v']);

    return payload;
  }
}
