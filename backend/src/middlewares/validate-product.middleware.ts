// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { CreateOrUpdateProductDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { Product } from 'src/schemas/product.schema';
import { _getParsedParams } from 'src/helpers/parser';
import { S3Service } from 'src/modules/s3/s3.service';
import { ALLOWED_USER_ROLES } from 'src/constants/constants';
import { ProductService } from 'src/modules/product/product.service';

@Injectable()
export class ValidateProductMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private productService: ProductService,
    private uploadService: S3Service,
  ) {}

  validateUserRole(user: any) {
    let validUserRole = false;

    const roles = parseArray(user.roles, []);

    for (const role of roles) {
      if (ALLOWED_USER_ROLES.product.includes(role)) {
        validUserRole = true;
      }
    }

    if (!validUserRole) {
      throw new UnauthorizedException('not authorized for creating/updating/deleting products');
    }
  }

  validatePatchRequest(method: string, oldProduct: CreateOrUpdateProductDto) {
    if (method.toUpperCase() === 'PATCH' && !oldProduct) {
      throw new NotFoundException('product not found');
    }
  }

  validateDeleteRequest(method: string, oldProduct?: CreateOrUpdateProductDto) {
    if (method.toUpperCase() === 'DELETE') {
      if (!oldProduct) {
        throw new NotFoundException('product not found');
      }
    }
  }

  validatePostRequest(method: string, product: CreateOrUpdateProductDto) {
    if (method.toUpperCase() === 'POST' && !product.user_id) {
      throw new UnauthorizedException('user_id required to create product');
    }
  }

  async validateAndParseProductImages(product: CreateOrUpdateProductDto) {
    const imageUids = parseArray(product.images, []);

    let newImageUids = [];

    try {
      if (!_.isEmpty(imageUids)) {
        const uploads = await this.uploadService.getAllUploads(imageUids);

        newImageUids = _.map(uploads, (upload) => upload.uid);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return newImageUids;
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { product = {} },
    } = req;
    const params = _getParsedParams(req.params);
    const parsedProduct = this.productService.getParsedProductBody(product, user);
    const findQuery = _.filter([{ uid: params.productId }, { user_id: user.uid }], _notEmpty);

    this.validateUserRole(user);
    this.validatePostRequest(req.method, parsedProduct);

    let oldProduct: any;

    try {
      oldProduct = await this.productModel.findOne({ $and: findQuery });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.validatePatchRequest(req.method, oldProduct);
    this.validateDeleteRequest(req.method, oldProduct);

    try {
      parsedProduct.images = await this.validateAndParseProductImages(parsedProduct);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!oldProduct) {
      oldProduct = new this.productModel();
    }

    // attach to response
    res.locals.oldProduct = oldProduct;
    res.locals.product = parsedProduct;

    next();
  }
}
