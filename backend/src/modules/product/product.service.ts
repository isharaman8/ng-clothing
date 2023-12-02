// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  _getUidAggregationFilter,
  _getNameAggregationFilter,
  _getPriceAggregationFilter,
  _getActiveAggregationFilter,
} from 'src/helpers/aggregationFilters';
import { Product } from 'src/schemas/product.schema';
import { _getProductPayload } from 'src/helpers/product';

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

  async createOrUpdateProduct(product: any, oldProduct: any) {
    const payload = _getProductPayload(product, oldProduct);

    try {
      await this.productModel.updateOne({ uid: payload.uid }, payload, {
        upsert: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }
}
