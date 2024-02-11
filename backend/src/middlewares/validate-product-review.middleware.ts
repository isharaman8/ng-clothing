// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { Review } from 'src/schemas/review.schema';
import { CRequest, CResponse } from 'src/interfaces';
import { S3Service } from 'src/modules/s3/s3.service';
import { CreateOrUpdateProductReviewDto } from 'src/dto';
import { ALLOWED_USER_ROLES } from 'src/constants/constants';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { PurchaseService } from 'src/modules/purchase/purchase.service';
import { ReviewService } from 'src/modules/product/product-review.service';

@Injectable()
export class ValidateProductReviewMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private uploadService: S3Service,
    private reviewService: ReviewService,
    private purchaseService: PurchaseService,
  ) {}

  validateUserRole(user: any) {
    let validUserRole = false;

    const roles = parseArray(user.roles, []);

    for (const role of roles) {
      if (_.includes(ALLOWED_USER_ROLES.review, role)) {
        validUserRole = true;
      }
    }

    if (!validUserRole) {
      throw new UnauthorizedException('not authorized for creating/updating/deleting reviews');
    }
  }

  validatePatchRequest(method: string, oldReview: CreateOrUpdateProductReviewDto) {
    if (method.toUpperCase() === 'PATCH' && !oldReview) {
      throw new NotFoundException('review not found');
    }
  }

  validateDeleteRequest(method: string, oldReview?: CreateOrUpdateProductReviewDto) {
    if (method.toUpperCase() === 'DELETE') {
      if (!oldReview?.active) {
        throw new NotFoundException('review not found');
      }
    }
  }

  validatePostRequest(
    method: string,
    review: Partial<CreateOrUpdateProductReviewDto>,
    oldReview: Partial<CreateOrUpdateProductReviewDto>,
    params: any = {},
  ) {
    if (!params.productId) {
      throw new BadRequestException('product_uid required in review response');
    }

    if (method.toUpperCase() === 'POST') {
      if (!review.user_id) {
        throw new UnauthorizedException('user_id required to create review');
      }

      if (!_.isEmpty(oldReview)) {
        throw new BadRequestException('your review for this product already exists');
      }
    }
  }

  async validateAndParseProductReviewImages(review: Partial<CreateOrUpdateProductReviewDto>) {
    const imageUids = parseArray(review.images, []);
    const uploadQuery = _getParsedQuery({ uid: imageUids });

    let uploads = [];

    if (_.isEmpty(imageUids)) {
      return uploads;
    }

    uploads = await this.uploadService.getAllUploads(uploadQuery);

    return uploads;
  }

  async validateProductUidInUserPurchase(productUid: string, user: any) {
    if (!user.uid) {
      throw new InternalServerErrorException('user.uid not handled properly in validateProductUidInUserPurchase');
    }

    const query = _getParsedQuery({ product_uid: productUid, reviews: null, verified: true, user_id: user.uid });

    let reqdPurchase: any = await this.purchaseService.getAllPurchases(query);

    if (_.isEmpty(reqdPurchase)) {
      throw new NotFoundException('either user has not purchased this product or the product does not exists');
    }
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { review = {} },
    } = req;
    const params = _getParsedParams(req.params);
    const parsedReview = this.reviewService.getParsedReviewPayload(params.productId, review, user);
    const findQuery = _getParsedQuery({ uid: params.reviewId, product_uid: params.productId, user_id: user.uid });

    let oldReview: any;
    let uploadedImages: any = [];

    findQuery['active'] = null;

    this.validateUserRole(user);
    await this.validateProductUidInUserPurchase(params.productId, user);

    const tempOldReview = await this.reviewService.getAllProductReviews(findQuery);

    oldReview = _.last(tempOldReview);

    this.validatePostRequest(req.method, parsedReview, oldReview, params);
    this.validatePatchRequest(req.method, oldReview);
    this.validateDeleteRequest(req.method, oldReview);

    uploadedImages = await this.validateAndParseProductReviewImages(parsedReview);

    parsedReview.images = _.map(uploadedImages, (image) => image.uid);

    if (!oldReview) {
      oldReview = new this.reviewModel();
    }

    // attach to response
    res.locals.oldReview = oldReview;
    res.locals.review = parsedReview;
    res.locals.uploadedImages = uploadedImages;

    next();
  }
}
