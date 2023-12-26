// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { parseArray, parseBoolean } from 'src/utils';
import { Purchase } from 'src/schemas/purchase.schema';
import { SharedService } from '../shared/shared.service';
import { _getUidAggregationFilter, _getVerifiedAggregationFilter } from 'src/helpers/aggregationFilters';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private sharedService: SharedService,
  ) {}

  async createOrUpdatePurchase(purchase: any, oldPurchase: CreateOrUpdatePurchaseDto, user: any = {}) {
    const payload = this.getCreateOrUpdatePurchasePayload(purchase, oldPurchase, user);

    try {
      await this.purchaseModel.updateOne({ uid: payload.uid }, payload, { upsert: true });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  async getAllPurchases(query: any = {}) {
    const baseQuery = [
      {
        $match: {
          $and: [..._getUidAggregationFilter(query), ..._getVerifiedAggregationFilter(query)],
        },
      },
    ];

    let purchases = [];

    console.log('PURCHASE QUERY', JSON.stringify(baseQuery));

    try {
      purchases = await this.purchaseModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return purchases;
  }

  async getUpatedPurchaseImageUrls(purchases: Array<CreateOrUpdatePurchaseDto>) {
    const imageUids = _.compact(
      _.flatMap(purchases, (purchase) => _.flatMap(purchase.products, (product) => product.images)),
    );

    let dbImages = [];

    try {
      // fetching uids
      dbImages = await this.sharedService.getUpdatedDbImageArray(imageUids);

      // parsing purchases for responses
      for (const purchase of purchases) {
        for (const product of purchase.products) {
          const reqdImages = _.filter(dbImages, (image) => _.includes(product.images, image.uid));

          product['images'] = _.map(reqdImages, (img) => img.url);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return purchases;
  }

  getParsedPurchaseBody(body: any = {}, user: any = {}) {
    const { uid, products, verified } = body;

    const payload: any = {
      uid: _.defaultTo(uid, null),
      products: parseArray(products, []),
      user_id: _.defaultTo(user.uid, null),
      verified: parseBoolean(verified, false),
    };

    return payload;
  }

  getParsedPurchaseResponsePayload(purchase: any = {}) {
    purchase = JSON.parse(JSON.stringify(purchase));

    // delete unnecessary properties
    delete purchase.$setOnInsert;
    delete purchase._id;
    delete purchase.__v;

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
      products: parseArray(purchase.products, oldPurchase.products),
    };
  }
}
