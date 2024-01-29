// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { UploadedImage } from 'src/interfaces';
import { Review } from 'src/schemas/review.schema';
import { _getParsedQuery } from 'src/helpers/parser';
import { parseArray, parseBoolean, parseNumber } from 'src/utils';
import { CreateOrUpdateProductReviewDto, CreateOrUpdateUserDto } from 'src/dto';
import { _getUidAggregationFilter, _getProductReviewFilter } from '../../helpers/aggregationFilters';

@Injectable()
export class ReviewService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async getAllProductReviews(query: any = {}) {
    const baseQuery = [
      {
        $match: {
          $and: [..._getUidAggregationFilter(query), ..._getProductReviewFilter(query)],
        },
      },
      {
        $skip: query.pageSkip,
      },
      {
        $limit: query.pageSize,
      },
    ];

    let reviews = [];

    if (!query.productId) {
      throw new BadRequestException('product id is required for reviews');
    }

    console.log('ALL PRODUCT REVEIWS', JSON.stringify(baseQuery));

    try {
      reviews = await this.reviewModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return reviews;
  }

  async createOrUpdateReview(review: any = {}, oldReview: Partial<CreateOrUpdateProductReviewDto> = {}) {
    const payload = this.getReviewPayload(review, oldReview);

    try {
      await this.reviewModel.updateOne({ uid: oldReview.uid }, payload, { upsert: true });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  async deleteReview(oldReview: Partial<CreateOrUpdateProductReviewDto> = {}, user: Partial<CreateOrUpdateUserDto>) {
    if (!oldReview.uid) {
      throw new BadRequestException('no uid provided to delete');
    }

    try {
      await this.reviewModel.updateOne({ uid: oldReview.uid, user_id: user.uid }, { active: false });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }

  getParsedReviewPayload(product_id: string, body: any = {}, user: any = {}) {
    const { description, rating, images, active } = body;

    return {
      user_id: user.uid,
      rating: parseNumber(rating, 1),
      images: parseArray(images, null),
      active: parseBoolean(active, true),
      product_id: _.defaultTo(product_id, null),
      description: _.defaultTo(description, null),
    };
  }

  getReviewPayload(review: any = {}, oldReview: Partial<CreateOrUpdateProductReviewDto> = {}) {
    return {
      uid: _.defaultTo(oldReview.uid, nanoid()),
      user_id: _.defaultTo(review.user_id, oldReview.uid),
      images: parseArray(review.images, oldReview.images),
      rating: _.defaultTo(review.rating, oldReview.rating),
      product_id: _.defaultTo(review.product_id, oldReview.product_id),
      description: _.defaultTo(review.description, oldReview.description),
      active: _.includes([true, false], parseBoolean(review.active, oldReview.active))
        ? parseBoolean(review.active, oldReview.active)
        : true,
    };
  }

  getParsedReviewResponsePayload(payload: any = {}) {
    payload = JSON.parse(JSON.stringify(payload));
    payload = _.omit(payload, ['_id', '__v', '$setOnInsert']);

    // parse images for object or string
    payload.images = _.map(payload.images, (image: UploadedImage | string) =>
      typeof image === 'string' ? image : image.url,
    );

    return payload;
  }
}
