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
import { _getPurchasePayload } from 'src/helpers/purchase';
import { _getUidAggregationFilter, _getVerifiedAggregationFilter } from 'src/helpers/aggregationFilters';

@Injectable()
export class PurchaseService {
  constructor(@InjectModel(Purchase.name) private purchaseModel: Model<Purchase>) {}

  async createOrUpdatePurchase(purchase: any, oldPurchase: CreateOrUpdatePurchaseDto, user: any = {}) {
    const payload = _getPurchasePayload(purchase, oldPurchase, user);

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

  getPurchasePayload(purchase: any = {}, oldPurchase: any = {}, user: any = {}): CreateOrUpdatePurchaseDto {
    return {
      user_id: user.uid,
      uid: _.defaultTo(oldPurchase.uid, nanoid()),
      verified: parseBoolean(purchase.verified, false),
      products: parseArray(purchase.products, oldPurchase.products),
    };
  }
}
