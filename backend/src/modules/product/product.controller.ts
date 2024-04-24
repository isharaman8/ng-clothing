// third party imports
import * as _ from 'lodash';
import { Res, Req, Get, Post, Body, Patch, Param, Query, Delete, Controller } from '@nestjs/common';

// inner imports
import { ProductService } from './product.service';
import { UserService } from '../user/user.service';
import { CRequest, CResponse } from 'src/interfaces';
import { ReviewService } from './product-review.service';
import { REVIEW_USER_PROJECTION } from 'src/constants/constants';
import { _getParsedQuery, _getParsedParams } from 'src/helpers/parser';
import { BulkCreateOrUpdateProductDto, CreateOrUpdateProductReviewDto } from 'src/dto';

@Controller('product')
export class ProductController {
  constructor(
    private productService: ProductService,
    private reviewService: ReviewService,
    private userService: UserService,
  ) {}

  // internal helper functions

  private async getReviewUserDetails(products: Partial<any>) {
    let reviewUserDetails = [];
    let reviewUserUids = _.compact(
      _.flatMapDeep(products, (product) => [product.user_id, ..._.map(product.reviews, (review) => review.user_id)]),
    );

    const userQuery = _getParsedQuery({ uid: reviewUserUids, active: true });

    reviewUserDetails = await this.userService.getAllUsers(userQuery, REVIEW_USER_PROJECTION);

    return reviewUserDetails;
  }

  private async createOrUpdateProductHandler(request: CRequest, response: CResponse, statusCode: number) {
    const { oldProducts, products: payload, uploadedImages } = response.locals;
    const { user = {} } = request;

    let createdProducts: any;

    // remove unwanted attributes
    delete payload.active;

    createdProducts = await this.productService.createOrUpdateProduct(payload, oldProducts, user);

    // get updated product images
    const tempProducts = await this.productService.getUpdatedImageArrayAndPopulateUserData(
      createdProducts,
      [],
      'product',
      uploadedImages,
    );

    createdProducts = tempProducts;
    createdProducts = _.map(createdProducts, (createdProduct) =>
      this.productService.getParsedProductResponsePayload(createdProduct),
    );

    return response.status(statusCode).send({ products: createdProducts });
  }

  private async getProductsHandler(query: any, params: any, response: CResponse) {
    let products = [];
    let reviewUserDetails = [];

    const parsedQuery = _getParsedQuery(query);
    const parsedParams = _getParsedParams(params);

    if (parsedParams.productId) {
      parsedQuery.uid = parsedParams.productId;
    }

    products = await this.productService.getAllProducts(parsedQuery);

    // get review user details
    if (parsedQuery.reviews) {
      reviewUserDetails = await this.getReviewUserDetails(products);
    }

    // get updated product images
    products = await this.productService.getUpdatedImageArrayAndPopulateUserData(
      products,
      reviewUserDetails,
      'product',
    );

    // parse response payload
    products = _.map(products, (product) => {
      const retProduct = this.productService.getParsedProductResponsePayload(product);

      // parse review;
      if (parsedQuery.reviews) {
        retProduct['reviews'] = _.map(retProduct.reviews, this.reviewService.getParsedReviewResponsePayload);
      }

      return retProduct;
    });

    return response.status(200).send({ products });
  }

  private async createOrUpdateReviewHandler(response: CResponse, statusCode: number) {
    const { review, oldReview, uploadedImages } = response.locals;

    let createdReview: any;

    createdReview = await this.reviewService.createOrUpdateReview(review, oldReview);

    // parse review images
    const tempReview = await this.productService.getUpdatedImageArrayAndPopulateUserData(
      [createdReview],
      [],
      'review',
      uploadedImages,
    );

    createdReview = tempReview[0];
    createdReview = this.reviewService.getParsedReviewResponsePayload(createdReview);

    return response.status(statusCode).send({ review: createdReview });
  }

  private async getProductsReviewHandler(query: any, params: any, response: CResponse) {
    const parsedParams = _getParsedParams(params);
    const parsedQuery = _getParsedQuery(query);

    if (parsedParams.productId) {
      parsedQuery['productId'] = parsedParams.productId;
    }

    let reviews = await this.reviewService.getAllProductReviews(parsedQuery);

    const reviewUsers = await this.getReviewUserDetails(reviews);

    // get updated product images
    reviews = await this.productService.getUpdatedImageArrayAndPopulateUserData(reviews, reviewUsers, 'review');

    // parse response
    reviews = _.map(reviews, this.reviewService.getParsedReviewResponsePayload);

    return response.status(200).send({ reviews });
  }

  // main controllers

  @Get()
  async getProducts(@Query() query: any, @Res() response: CResponse) {
    await this.getProductsHandler(query, {}, response);
  }

  @Get(':product_uid')
  async getProductByUid(@Query() query: any, @Param() params: any, @Res() response: CResponse) {
    await this.getProductsHandler(query, params, response);
  }

  @Post('')
  async createProduct(
    @Body() _products: BulkCreateOrUpdateProductDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateProductHandler(request, response, 201);
  }

  @Patch(':product_uid')
  async updateProduct(
    @Body() _products: Partial<BulkCreateOrUpdateProductDto>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateProductHandler(request, response, 200);
  }

  @Patch('')
  async updateProducts(
    @Body() _product: Partial<BulkCreateOrUpdateProductDto>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    try {
      await this.createOrUpdateProductHandler(request, response, 200);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':product_uid')
  async deleteProduct(@Param() params: any, @Res() response: CResponse) {
    const parsedParams = _getParsedParams(params);

    await this.productService.deleteProduct(parsedParams.productId);

    return response.status(204).send();
  }

  @Get('review/all')
  async getProductReviews(@Query() query: any, @Res() response: CResponse) {
    await this.getProductsReviewHandler(query, {}, response);
  }

  @Get(':product_uid/review')
  async getSingleProductReviews(@Param() params: any, @Query() query: any, @Res() response: CResponse) {
    await this.getProductsReviewHandler(query, params, response);
  }

  @Post(':product_uid/review')
  async createProductReview(@Body('review') _review: CreateOrUpdateProductReviewDto, @Res() response: CResponse) {
    await this.createOrUpdateReviewHandler(response, 201);
  }

  @Patch(':product_uid/review/:review_uid')
  async updateProductReview(
    @Body('review') _review: Partial<CreateOrUpdateProductReviewDto>,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateReviewHandler(response, 200);
  }

  @Delete(':product_uid/review/:review_uid')
  async deleteProductReview(@Req() request: CRequest, @Res() response: CResponse) {
    const { oldReview } = response.locals;

    await this.reviewService.deleteReview(oldReview, request.user);

    return response.status(204).send();
  }
}
