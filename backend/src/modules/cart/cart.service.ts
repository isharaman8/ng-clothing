// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { nanoid } from 'nanoid';
import { Cart } from 'src/schemas/cart.schema';
import { parseArray, parseNumber } from 'src/utils';
import { CreateOrUpdateCartDto, CreateOrUpdateUserDto } from 'src/dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async getUserCart(user: CreateOrUpdateUserDto) {
    let cart = { products: [] };

    try {
      cart = await this.cartModel.findOne({ user_id: user.uid });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return cart;
  }

  async createOrUpdateUserCart(body: Partial<CreateOrUpdateCartDto>, oldCart: CreateOrUpdateCartDto, user: any) {
    const payload = this.getCartPayload(body, oldCart, user);

    let updatedCart = { products: [] };

    try {
      if (!oldCart.uid) {
        updatedCart = await this.cartModel.create(body);
      } else {
        updatedCart = await this.cartModel.findOneAndUpdate(
          { uid: body.uid },
          { $set: { products: payload.products } },
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
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

  getParsedCartPayload(body: any = {}) {
    return {
      uid: _.defaultTo(body.uid, null),
      products: _.defaultTo(body.products, null),
    };
  }

  getCartPayload(cartPayload: any = {}, oldCart: any = {}, user: any = {}) {
    const { products } = cartPayload;
    const payload = {
      uid: _.defaultTo(oldCart.uid, nanoid()),
      products: parseArray(products, oldCart.products) || [],
      user_id: user.uid,
    };

    return payload;
  }
}
