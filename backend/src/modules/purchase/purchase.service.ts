// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { CreateOrUpdatePurchaseDto } from 'src/dto';
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
}
