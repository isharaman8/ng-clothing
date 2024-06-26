// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { nanoid } from 'nanoid';
import { Cart } from 'src/schemas/cart.schema';
import { parseArray, parseNumber } from 'src/utils';
import { SharedService } from '../shared/shared.service';
import { CreateOrUpdateCartDto, CreateOrUpdateUserDto } from 'src/dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private sharedService: SharedService,
  ) {}

  async getUserCart(user: CreateOrUpdateUserDto) {
    let cart: any = { products: [] };

    try {
      const tempCart = await this.cartModel.findOne({ user_id: user.uid });

      if (!_.isEmpty(tempCart)) {
        cart = tempCart;
      }
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
        updatedCart = await this.cartModel.create(payload);
      } else {
        updatedCart = await this.cartModel.findOneAndUpdate(
          { uid: oldCart.uid },
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
    const payload = {
      uid: _.defaultTo(body.uid, null),
      products: parseArray(body.products, null),
    };

    if (body.products && !_.isArray(body.products)) {
      payload['products_add'] = parseArray(body.products['add'], []);
      payload['products_remove'] = parseArray(body.products['remove'], []);
      payload['products_modify'] = parseArray(body.products['modify'], []);
    }

    return payload;
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

  async getUpatedCartImageUrls(cart: CreateOrUpdateCartDto) {
    const imageUids = _.compact(_.flatMap(cart.products, (product) => product.images));

    let dbImages = [];

    // fetching uids
    if (!_.isEmpty(imageUids)) {
      dbImages = await this.sharedService.getUpdatedDbImageArray(imageUids);
    }

    // parsing carts for responses

    for (const product of cart.products) {
      const reqdImages = _.filter(dbImages, (image) => _.includes(product.images, image.uid));

      product['images'] = _.map(reqdImages, (img) => img.url);
    }

    return cart;
  }
}
