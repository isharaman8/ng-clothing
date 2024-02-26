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
  _getSlugAggregationFilter,
  _getPriceAggregationFilter,
  _getActiveAggregationFilter,
  _getGenderAggregationFilter,
  _getPaginationAggregationFilter,
  _getAvailableSizesAggregationFilter,
} from 'src/helpers/aggregationFilters';
import { Product } from 'src/schemas/product.schema';
import { _getParsedQuery } from 'src/helpers/parser';
import { SharedService } from '../shared/shared.service';
import { CategoryService } from '../category/category.service';
import { ALLOWED_PRODUCT_SIZES } from 'src/constants/constants';
import { CreateOrUpdateProductDto, CreateOrUpdateUserDto } from 'src/dto';
import { parseArray, parseBoolean, parseNumber, parseObject } from 'src/utils';
import { ProductResponse, ProductReviewResponse, UploadedImage } from 'src/interfaces';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private sharedService: SharedService,
    private categoryService: CategoryService,
  ) {}

  // internal function
  private populateUserDataAndForward(
    reviewUserDetails: Array<Partial<CreateOrUpdateUserDto>>,
    dbImages: Array<any>,
    obj: any = {},
  ) {
    const reqdUserDetail = _.find(reviewUserDetails, (user) => user.uid === obj.user_id);

    if (!_.isEmpty(reqdUserDetail)) {
      const reqdUserDbImage = _.find(dbImages, (image) => reqdUserDetail.profile_picture === image.uid);

      obj['user_name'] = reqdUserDetail.name;
      obj['user_profile_picture'] = _.defaultTo(reqdUserDbImage?.url, null);
    }
  }

  async getAllProducts(query: any = {}) {
    let products = [];

    const baseQuery: any = [
      {
        $match: {
          $and: [
            ..._getActiveAggregationFilter(query),
            ..._getNameAggregationFilter(query),
            ..._getSlugAggregationFilter(query),
            ..._getPriceAggregationFilter(query),
            ..._getAvailableSizesAggregationFilter(query),
            ..._getUidAggregationFilter(query),
            ..._getGenderAggregationFilter(query),
          ],
        },
      },
    ];

    if (query.reviews) {
      // lookup query for reviews
      baseQuery.push(
        {
          $lookup: {
            from: 'reviews',
            let: { productId: '$uid' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$product_id', '$$productId'] }, { $eq: ['$active', true] }],
                  },
                },
              },
              {
                $group: {
                  _id: '$product_id',
                  averageRating: { $avg: '$rating' },
                  reviews: { $push: '$$ROOT' },
                },
              },
              {
                $project: {
                  _id: 0,
                  averageRating: 1,
                  reviews: { $slice: ['$reviews', 10] }, // Adjust the values as needed
                },
              },
              {
                $project: {
                  _id: 0,
                  averageRating: 1,
                  reviews: 1,
                },
              },
            ],
            as: 'reviews',
          },
        },
        {
          $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            average_rating: { $ifNull: ['$reviews.averageRating', 0] },
            reviews: { $ifNull: ['$reviews.reviews', []] },
          },
        },
        {
          $project: {
            'reviews._id': 0,
            'reviews.__v': 0,
            'reviews.active': 0,
            'reviews.created_at': 0,
            'reviews.updated_at': 0,
            'reviews.product_id': 0,
          },
        },
      );
    }

    // add pagination
    baseQuery.push(..._getPaginationAggregationFilter(query));

    console.log('PRODUCT AGGREGATION QUERY', JSON.stringify(baseQuery));

    try {
      products = await this.productModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return products;
  }

  async createOrUpdateProduct(product: any, oldProduct: any, user: any) {
    const resData = [];
    const bulkUpdateArray = [];
    const products = parseArray(product, [product]);
    const oldProducts = parseArray(oldProduct, [oldProduct]);

    for (const product of products) {
      const oldProduct = _.find(oldProducts, (oldProduct) => oldProduct.uid === product.uid);
      const payload = this.getCreateOrUpdateProductPayload(product, oldProduct, user);

      if (_.isEmpty(oldProduct)) {
        bulkUpdateArray.push({
          insertOne: {
            document: payload,
          },
        });
      } else {
        bulkUpdateArray.push({
          updateOne: {
            filter: { uid: oldProduct.uid },
            update: {
              $set: payload,
            },
          },
        });
      }

      resData.push(payload);
    }

    try {
      if (!_.isEmpty(bulkUpdateArray)) {
        await this.productModel.bulkWrite(bulkUpdateArray);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return resData;
  }

  async deleteProduct(productUid: string) {
    try {
      await this.productModel.updateOne({ uid: productUid }, { active: false });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }

  async bulkUpdateOp(bulkUpdateArray: Array<any>) {
    try {
      if (!_.isEmpty(bulkUpdateArray)) {
        await this.productModel.bulkWrite(bulkUpdateArray);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getParsedProductBody(body: CreateOrUpdateProductDto, user: any = {}) {
    const { active, images, name, price, uid, description, category, gender, available_sizes } = body;

    const payload: any = {
      uid: _.defaultTo(uid, null),
      name: _.defaultTo(name, null),
      price: parseNumber(price, null),
      images: parseArray(images, null),
      gender: _.defaultTo(gender, null),
      active: parseBoolean(active, true),
      user_id: _.defaultTo(user.uid, null),
      category: _.defaultTo(category, null),
      description: _.defaultTo(description, null),
      available_sizes: parseObject(available_sizes, null),
    };

    return payload;
  }

  getParsedProductResponsePayload(product: any = {}, categories: any = []) {
    product = JSON.parse(JSON.stringify(product));

    const reqdCategory = _.find(categories, (category) => category.uid === product.category) || {};

    product.category = reqdCategory;

    // delete unnecessary properties
    delete product.$setOnInsert;
    delete product._id;
    delete product.__v;

    // parse images for object or string
    product.images = _.map(product.images, (image: UploadedImage | string) =>
      typeof image === 'string' ? image : image.url,
    );

    return product;
  }

  getCreateOrUpdateProductPayload(product: any = {}, oldProduct: any = {}, user: any = {}): CreateOrUpdateProductDto {
    const payload = {
      uid: _.defaultTo(oldProduct.uid, nanoid()),
      name: _.defaultTo(product.name, oldProduct.name),
      slug: _.defaultTo(product.slug, oldProduct.slug),
      user_id: _.defaultTo(oldProduct.user_id, user.uid),
      price: parseNumber(product.price, oldProduct.price),
      images: parseArray(product.images, oldProduct.images),
      gender: _.defaultTo(product.gender, oldProduct.gender),
      active: parseBoolean(product.active, oldProduct.active),
      category: _.defaultTo(product.category, oldProduct.category),
      description: _.defaultTo(product.description, oldProduct.description),
      available_sizes: _.defaultTo(product.available_sizes, oldProduct.available_sizes) || ALLOWED_PRODUCT_SIZES,
    };

    return payload;
  }

  async getUpdatedImageArrayAndPopulateUserData(
    products: Array<ProductResponse | ProductReviewResponse>,
    reviewUserDetails: Array<Partial<CreateOrUpdateUserDto>> = [],
    type: 'product' | 'review',
    uploadedImages: any = [],
  ) {
    const imageUids = [
      ..._.compact(
        _.flatMapDeep(products, (product) => {
          const array = [];

          // push product image uids;
          array.push(...parseArray(product.images, []));

          // push product review image uids;
          if (_.isArray(product.reviews)) {
            array.push(_.map(product.reviews, (review) => parseArray(review.images, [])));
          }

          return array;
        }),
      ),

      ..._.compact(_.map(reviewUserDetails, (user) => user.uid)),
    ];

    let dbImages = [];

    // fetching uploaded images
    if (!_.isEmpty(uploadedImages)) {
      dbImages = uploadedImages;
    } else {
      dbImages = await this.sharedService.getUpdatedDbImageArray(imageUids);
    }

    // parsing product.images for response;
    for (const product of products) {
      // parse main product images
      const reqdDBImages = _.filter(dbImages, (image) => _.includes(product.images, image.uid));

      product['images'] = reqdDBImages;

      // parse product reviews images and populate user data
      if (type === 'product') {
        for (const review of parseArray(product.reviews, [])) {
          const reqDbImageReview = _.filter(dbImages, (image) => _.includes(review.images, image.uid));

          review['images'] = _.map(reqDbImageReview, (image) => image.url);

          this.populateUserDataAndForward(reviewUserDetails, dbImages, review);
        }
      } else if (type === 'review') {
        this.populateUserDataAndForward(reviewUserDetails, dbImages, product);
      }
    }

    return products;
  }

  async getProductsCategoriesDetails(products: Array<CreateOrUpdateProductDto>) {
    // find all categories
    const categoryUids = _.compact(_.map(products, (pr) => pr.category));
    const query = _getParsedQuery({ uid: categoryUids });

    let categories = [];

    if (_.isEmpty(categoryUids)) {
      return categories;
    }

    categories = await this.categoryService.getAllCategories(query);
    categories = _.map(categories, (category) => _.pick(category, ['name', 'uid', 'description', 'slug']));

    return categories;
  }
}
