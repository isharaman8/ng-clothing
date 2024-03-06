// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { PurchaseProduct } from 'src/interfaces';
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { Purchase } from 'src/schemas/purchase.schema';
import { SharedService } from '../shared/shared.service';
import { parseArray, parseBoolean, parseNumber } from 'src/utils';
import { ALLOWED_PRODUCT_SIZES, ALLOWED_PURCHASE_STATUS } from 'src/constants/constants';
import {
  _getUidAggregationFilter,
  _getProductPurchaseFilter,
  _getVerifiedAggregationFilter,
  _getPaginationAggregationFilter,
  _getPurchaseStatusAggregationFilter,
} from 'src/helpers/aggregationFilters';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private sharedService: SharedService,
  ) {}

  async createOrUpdatePurchase(purchase: any, oldPurchase: CreateOrUpdatePurchaseDto, user: any = {}) {
    const payload = this.getCreateOrUpdatePurchasePayload(purchase, oldPurchase, user);

    if (!oldPurchase.uid) {
      purchase['status'] = ALLOWED_PURCHASE_STATUS.pending_verification;
      purchase['verified'] = false;
    }

    try {
      await this.purchaseModel.updateOne({ uid: payload.uid }, payload, { upsert: true });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  async getAllPurchases(query: any = {}) {
    const baseQuery: any = [
      {
        $match: {
          $and: [
            ..._getUidAggregationFilter(query),
            ..._getVerifiedAggregationFilter(query),
            ..._getProductPurchaseFilter(query),
            ..._getPurchaseStatusAggregationFilter(query),
          ],
        },
      },
      ..._getPaginationAggregationFilter(query),
    ];

    let purchases = [];

    console.log('PURCHASE AGGREGATION QUERY', JSON.stringify(baseQuery));

    try {
      purchases = await this.purchaseModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return purchases;
  }

  async devGetAllPurchases() {
    let data = [];

    try {
      data = await this.purchaseModel.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  getUpdatedProductSizes(products: Array<PurchaseProduct>) {
    products = parseArray(products, []);

    const productSizeUpdateBulkArray = [];

    for (const product of products) {
      if (!product.available_sizes) {
        product.available_sizes = JSON.parse(JSON.stringify(ALLOWED_PRODUCT_SIZES));
      }

      product['available_sizes'][product.size] -= product.qty;

      productSizeUpdateBulkArray.push({
        updateOne: {
          filter: { uid: product.uid },
          update: { $set: { available_sizes: product.available_sizes } },
        },
      });
    }

    return productSizeUpdateBulkArray;
  }

  async getUpatedPurchaseImageUrls(purchases: Array<CreateOrUpdatePurchaseDto>) {
    const imageUids = _.compact(
      _.flatMap(purchases, (purchase) => _.flatMap(purchase.products, (product) => product.images)),
    );

    let dbImages = [];

    // fetching uids
    if (!_.isEmpty(imageUids)) {
      dbImages = await this.sharedService.getUpdatedDbImageArray(imageUids);
    }

    // parsing purchases for responses
    for (const purchase of purchases) {
      for (const product of purchase.products) {
        const reqdImages = _.filter(dbImages, (image) => _.includes(product.images, image.uid));

        product['images'] = _.map(reqdImages, (img) => img.url);
      }
    }

    return purchases;
  }

  getParsedPurchaseBody(body: any = {}, user: any = {}) {
    const { uid, products, verified, address_id } = body;

    const payload: any = {
      uid: _.defaultTo(uid, null),
      products: parseArray(products, []),
      user_id: _.defaultTo(user.uid, null),
      verified: parseBoolean(verified, false),
      address_id: _.defaultTo(address_id, null),
    };

    return payload;
  }

  getParsedPurchaseResponsePayload(purchase: any = {}, userAddresses: any = []) {
    purchase = JSON.parse(JSON.stringify(purchase));

    const totalCartPrice = _.reduce(
      purchase.products,
      (acc, curr) => acc + parseNumber(curr.price, 0) * parseNumber(curr.qty, 0),
      0,
    );
    const reqdUserAddress = _.find(userAddresses, (address) => address.uid === purchase.address_id) || {};

    purchase['address'] = reqdUserAddress;
    purchase['total_price'] = totalCartPrice;

    // delete unnecessary properties
    delete purchase.$setOnInsert;
    delete purchase._id;
    delete purchase.__v;
    delete purchase.address_id;

    return purchase;
  }

  getCreateOrUpdatePurchasePayload(
    purchase: any = {},
    oldPurchase: any = {},
    user: any = {},
  ): CreateOrUpdatePurchaseDto {
    return {
      user_id: user.uid,
      uid: _.defaultTo(oldPurchase.uid, nanoid()),
      verified: parseBoolean(purchase.verified, false),
      status: _.defaultTo(purchase.status, oldPurchase.status),
      products: parseArray(purchase.products, oldPurchase.products),
      address_id: _.defaultTo(purchase.address_id, oldPurchase.address_id),
    };
  }
}
