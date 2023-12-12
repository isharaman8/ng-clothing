// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { S3Service } from '../s3/s3.service';
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { parseArray, parseBoolean } from 'src/utils';
import { Purchase } from 'src/schemas/purchase.schema';
import { S3GetUrlArray, UploadedImage } from 'src/interfaces';
import { _getUidAggregationFilter, _getVerifiedAggregationFilter } from 'src/helpers/aggregationFilters';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private s3Service: S3Service,
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
    const s3Array: Array<S3GetUrlArray> = [];

    let dbImages = [];
    let updatedFileUrls = [];

    try {
      // fetching uids
      dbImages = await this.s3Service.getAllUploads(imageUids);
      dbImages = JSON.parse(JSON.stringify(dbImages));

      // filtering images that needs to be updated
      for (const image of dbImages) {
        const imageExpiryDate = new Date(image.urlExpiryDate),
          currentDate = new Date();

        if (currentDate >= imageExpiryDate) {
          s3Array.push({ uid: image.uid, bucket: image.bucket, key: image.key });
        }
      }

      // fetching updated urls
      if (s3Array.length) {
        updatedFileUrls = await this.s3Service.getUpdatedFileUrls(s3Array);
      }

      // updating dbimage array
      for (const url of updatedFileUrls) {
        const reqdDBImageIndex = _.find(dbImages, (image) => image.uid === url.uid);

        if (reqdDBImageIndex !== -1) {
          const oldImage: UploadedImage = dbImages[reqdDBImageIndex],
            newImage: UploadedImage = { ...oldImage, url: url.url, urlExpiryDate: url.urlExpiryDate };

          dbImages[reqdDBImageIndex] = newImage;
        }
      }

      // parsing purchases for responses
      for (const purchase of purchases) {
        for (const product of purchase.products) {
          const reqdImages = _.filter(dbImages, (image) => _.includes(product.images, image.uid));

          product['images'] = _.map(reqdImages, (img) => img.url);
        }
      }

      // parsing for
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
