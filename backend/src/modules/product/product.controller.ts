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
import { BulkCreateOrUpdateProductDto, CreateOrUpdateProductDto, CreateOrUpdateProductReviewDto } from 'src/dto';

@Controller('product')
export class ProductController {
  constructor(
    private productService: ProductService,
    private reviewService: ReviewService,
    private userService: UserService,
  ) {}

  // internal helper functions

  // get review user details
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
    const { oldProducts, products: payload, productCategories } = response.locals;
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
    );

    createdProducts = tempProducts;
    createdProducts = _.map(createdProducts, (createdProduct) =>
      this.productService.getParsedProductResponsePayload(createdProduct, productCategories),
    );

    return response.status(statusCode).send({ products: createdProducts });
  }

  @Get()
  async getProducts(@Query() query: any, @Res() response: CResponse) {
    const parsedQuery = _getParsedQuery(query);

    let products = [];
    let categories = [];
    let reviewUserDetails = [];

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

    // get categories
    categories = await this.productService.getProductsCategoriesDetails(products);

    // parse response payload
    products = _.map(products, (product) => {
      const retProduct = this.productService.getParsedProductResponsePayload(product, categories);

      // parse review;
      if (parsedQuery.reviews) {
        retProduct['reviews'] = _.map(retProduct.reviews, this.reviewService.getParsedReviewResponsePayload);
      }

      return retProduct;
    });

    return response.status(200).send({ products });
  }

  @Get(':product_uid')
  async getProductByUid(@Query() query: any, @Param() params: any, @Res() response: CResponse) {
    let product: any;
    let categories = [];
    let reviewUserDetails = [];

    const parsedQuery = _getParsedQuery(query);
    const parsedParams = _getParsedParams(params);

    parsedQuery.uid = parsedParams.productId;

    product = await this.productService.getAllProducts(parsedQuery);

    // get review user details
    if (parsedQuery.reviews) {
      reviewUserDetails = await this.getReviewUserDetails(product);
    }

    // get updated product images
    product = await this.productService.getUpdatedImageArrayAndPopulateUserData(product, reviewUserDetails, 'product');

    // get categories
    categories = await this.productService.getProductsCategoriesDetails(product);

    // parse response payload
    product = _.map(product, (pr) => {
      const retProduct = this.productService.getParsedProductResponsePayload(pr, categories);

      // parse review;
      if (parsedQuery.reviews) {
        retProduct['reviews'] = _.map(retProduct.reviews, this.reviewService.getParsedReviewResponsePayload);
      }

      return retProduct;
    });

    return response.status(200).send({ products: product });
  }

  @Post('')
  async createProduct(
    @Body() _products: BulkCreateOrUpdateProductDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    try {
      this.createOrUpdateProductHandler(request, response, 201);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':product_uid')
  async updateProduct(
    @Body() _products: Partial<BulkCreateOrUpdateProductDto>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    try {
      await this.createOrUpdateProductHandler(request, response, 200);
    } catch (error) {
      throw error;
    }
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

  @Get(':product_uid/review')
  async getProductReviews(@Param() params: any, @Query() query: any, @Res() response: CResponse) {
    const parsedParams = _getParsedParams(params);
    const parsedQuery = _getParsedQuery(query);

    parsedQuery['productId'] = parsedParams.productId;

    let reviews = await this.reviewService.getAllProductReviews(parsedQuery);

    const reviewUsers = await this.getReviewUserDetails(reviews);

    // get updated product images
    reviews = await this.productService.getUpdatedImageArrayAndPopulateUserData(reviews, reviewUsers, 'review');

    // parse response
    reviews = _.map(reviews, this.reviewService.getParsedReviewResponsePayload);

    return response.status(200).send({ reviews });
  }

  @Post(':product_uid/review')
  async createProductReview(@Body('review') _review: CreateOrUpdateProductReviewDto, @Res() response: CResponse) {
    const { review, oldReview } = response.locals;

    let createdReview: any;

    createdReview = await this.reviewService.createOrUpdateReview(review, oldReview);

    // parse review images
    const tempReview = await this.productService.getUpdatedImageArrayAndPopulateUserData([createdReview], [], 'review');

    createdReview = tempReview[0];

    createdReview = this.reviewService.getParsedReviewResponsePayload(createdReview);

    return response.status(201).send({ review: createdReview });
  }

  @Patch(':product_uid/review/:review_uid')
  async updateProductReview(
    @Body('review') _review: Partial<CreateOrUpdateProductReviewDto>,
    @Res() response: CResponse,
  ) {
    const { review, oldReview } = response.locals;

    let createdReview: any;

    createdReview = await this.reviewService.createOrUpdateReview(review, oldReview);

    // parse review images
    const tempReview = await this.productService.getUpdatedImageArrayAndPopulateUserData([createdReview], [], 'review');

    createdReview = tempReview[0];

    createdReview = this.reviewService.getParsedReviewResponsePayload(createdReview);

    return response.status(201).send({ review: createdReview });
  }

  @Delete(':product_uid/review/:review_uid')
  async deleteProductReview(@Req() request: CRequest, @Res() response: CResponse) {
    const { oldReview } = response.locals;

    await this.reviewService.deleteReview(oldReview, request.user);

    return response.status(204).send();
  }
}
