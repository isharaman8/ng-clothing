// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import {
  _getUidAggregationFilter,
  _getNameAggregationFilter,
  _getPriceAggregationFilter,
  _getActiveAggregationFilter,
} from 'src/helpers/aggregationFilters';
import { CreateOrUpdateProductDto } from 'src/dto';
import { Product } from 'src/schemas/product.schema';
import { _getProductPayload } from 'src/helpers/product';
import { parseArray, parseBoolean, parseNumber } from 'src/utils';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async getAllProducts(query: any = {}) {
    let products = [];

    const baseQuery = [
      {
        $match: {
          $and: [
            ..._getActiveAggregationFilter(query),
            ..._getNameAggregationFilter(query),
            ..._getUidAggregationFilter(query),
            ..._getPriceAggregationFilter(query),
          ],
        },
      },
    ];

    console.log('USER FIND QUERY', JSON.stringify(baseQuery));

    try {
      products = await this.productModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return products;
  }

  async createOrUpdateProduct(product: any, oldProduct: any, user: any) {
    const payload = _getProductPayload(product, oldProduct, user);

    try {
      await this.productModel.updateOne({ uid: payload.uid }, payload, {
        upsert: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  async deleteProduct(productUid: string) {
    try {
      await this.productModel.updateOne({ uid: productUid }, { active: false });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }

  getParsedProductBody(body: CreateOrUpdateProductDto, user: any = {}) {
    const { active, images, name, price, uid } = body;

    const payload: any = {
      uid: _.defaultTo(uid, null),
      name: _.defaultTo(name, null),
      price: parseNumber(price, null),
      images: parseArray(images, null),
      active: parseBoolean(active, true),
      user_id: _.defaultTo(user.uid, null),
    };

    return payload;
  }

  getProductResponsePayload(product: any = {}) {
    product = JSON.parse(JSON.stringify(product));

    // delete unnecessary properties
    delete product.$setOnInsert;
    delete product._id;
    delete product.__v;

    return product;
  }

  getProductPayload(product: any = {}, oldProduct: any = {}, user: any = {}): CreateOrUpdateProductDto {
    const payload = {
      uid: _.defaultTo(oldProduct.uid, nanoid()),
      name: _.defaultTo(product.name, oldProduct.name),
      user_id: _.defaultTo(oldProduct.user_id, user.uid),
      price: parseNumber(product.price, oldProduct.price),
      images: parseArray(product.images, oldProduct.images),
      active: parseBoolean(product.active, oldProduct.active),
    };

    return payload;
  }
}
