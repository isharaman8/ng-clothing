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
import { S3Service } from '../s3/s3.service';
import { S3GetUrlArray, UploadedImage } from 'src/interfaces';
import { CreateOrUpdateProductDto } from 'src/dto';
import { Product } from 'src/schemas/product.schema';
import { parseArray, parseBoolean, parseNumber } from 'src/utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private s3Service: S3Service,
  ) {}

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
    const payload = this.getCreateOrUpdateProductPayload(product, oldProduct, user);

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

  getParsedProductResponsePayload(product: any = {}) {
    product = JSON.parse(JSON.stringify(product));

    // delete unnecessary properties
    delete product.$setOnInsert;
    delete product._id;
    delete product.__v;

    product.images = _.map(product.images, (image: UploadedImage | string) =>
      typeof image === 'string' ? image : image.url,
    );

    return product;
  }

  getCreateOrUpdateProductPayload(product: any = {}, oldProduct: any = {}, user: any = {}): CreateOrUpdateProductDto {
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

  async getUpdatedImageArray(products: Array<CreateOrUpdateProductDto>) {
    const bulkWriteArray = [];
    const newImageArrayMap = new Map();
    const s3Array: Array<S3GetUrlArray> = [];
    const imageUids = _.compact(_.flatMap(products, (product) => parseArray(product.images, [])));

    let updatedFileUrls = [];
    let dbImages = [];

    try {
      // fetching uploaded images
      dbImages = await this.s3Service.getAllUploads(imageUids);

      // filtering images that needs to be updated
      for (const product of products) {
        const reqdDBImages = _.filter(dbImages, (image) => product.images.includes(image.uid));

        for (const image of reqdDBImages) {
          const imageExpiryDate = new Date(image.urlExpiryDate),
            currentDate = new Date();

          if (currentDate >= imageExpiryDate) {
            s3Array.push({ uid: image.uid, bucket: image.bucket, key: image.key, service_uid: product.uid });
          }
        }
      }

      // fetching updated image objs
      if (s3Array.length) {
        updatedFileUrls = await this.s3Service.getUpdatedFileUrls(s3Array);
      }

      // setting new image array in newImageArrayMap with key = product.uid and value = newimages
      for (const url of updatedFileUrls) {
        const reqdProduct = _.find(products, (product) => product.uid === url.uid);
        const reqdImageIdx = _.findIndex(dbImages, (image) => image.uid === url.uid);

        if (reqdImageIdx !== -1) {
          const prevImageObj: UploadedImage = dbImages[reqdImageIdx];
          const newImageObj: UploadedImage = { ...prevImageObj, url: url.url, urlExpiryDate: url.urlExpiryDate };

          dbImages[reqdImageIdx] = newImageObj;

          const images: Array<UploadedImage> = _.filter(dbImages, (image) => reqdProduct.images.includes(image.uid));
          const newImageUids = _.map(images, (image: UploadedImage) => image.uid);

          reqdProduct.images = newImageUids;

          newImageArrayMap.set(reqdProduct.uid, images);
        }
      }

      // creating bulkwrite array
      newImageArrayMap.forEach((value, key) => {
        bulkWriteArray.push({
          updateOne: {
            filter: { uid: key },
            update: {
              $set: {
                images: _.map(parseArray(value, []), (image) => image.uid),
              },
            },
          },
        });
      });

      // parsing product.images for response;
      for (const product of products) {
        const reqdDBImages = _.filter(dbImages, (image) => product.images.includes(image.uid));

        product['images'] = reqdDBImages;
      }

      if (bulkWriteArray.length) {
        await this.productModel.bulkWrite(bulkWriteArray);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return products;
  }
}
