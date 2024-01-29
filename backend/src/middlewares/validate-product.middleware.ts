// third party imports
import * as _ from 'lodash';
import slugify from 'slugify';
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
import { CreateOrUpdateProductDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { Product } from 'src/schemas/product.schema';
import { S3Service } from 'src/modules/s3/s3.service';
import { _notEmpty, parseArray, parseObject } from 'src/utils';
import { ProductService } from 'src/modules/product/product.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { CategoryService } from 'src/modules/category/category.service';
import { ALLOWED_PRODUCT_SIZES, ALLOWED_USER_ROLES } from 'src/constants/constants';

@Injectable()
export class ValidateProductMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private productService: ProductService,
    private uploadService: S3Service,
    private categoryService: CategoryService,
  ) {}

  validateUserRole(user: any) {
    let validUserRole = false;

    const roles = parseArray(user.roles, []);

    for (const role of roles) {
      if (_.includes(ALLOWED_USER_ROLES.product, role)) {
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

  async validateAndParseProductSlug(product: CreateOrUpdateProductDto) {
    if (product.name) {
      const slug = slugify(product.name).toLowerCase();

      let tempProduct: any;

      try {
        tempProduct = await this.productModel.findOne({ slug });
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      if (!_.isEmpty(tempProduct) && tempProduct.uid !== product.uid) {
        throw new BadRequestException('slug already exists');
      }

      return slug;
    }

    return product.slug;
  }

  async validateProductCategory(product: CreateOrUpdateProductDto) {
    let reqdCategory = {};

    if (product.category) {
      const query = _getParsedQuery({ uid: product.category });

      try {
        reqdCategory = await this.categoryService.getAllCategories(query);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      if (_.isEmpty(reqdCategory)) {
        throw new BadRequestException('no category found');
      }

      reqdCategory = _.pick(parseObject(reqdCategory[0], {}), ['uid', 'name', 'description', 'slug']);
    }
    return reqdCategory;
  }

  async validateAndParseProductImages(product: CreateOrUpdateProductDto) {
    const imageUids = parseArray(product.images, []);

    let newImageUids = [];

    if (!product.images) {
      return null;
    }

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

  validateProductSizes(product: Partial<CreateOrUpdateProductDto>) {
    if (_.isEmpty(product.available_sizes)) {
      return true;
    }

    const providedSizes = _.keys(product.available_sizes);
    const validSizes = _.keys(ALLOWED_PRODUCT_SIZES);
    const invalidSizes = _.filter(providedSizes, (size) => !_.includes(validSizes, size));

    if (!_.isEmpty(invalidSizes)) {
      throw new BadRequestException(`invalid sizes provided: ${_.join(invalidSizes, ', ')}`);
    }
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { product = {} },
    } = req;
    const params = _getParsedParams(req.params);
    const parsedProduct = this.productService.getParsedProductBody(product, user);
    const findQuery = _.filter([{ uid: params.productId }, { user_id: user.uid }], _notEmpty);

    let oldProduct: any;
    let reqdCategory: any;

    this.validateUserRole(user);
    this.validatePostRequest(req.method, parsedProduct);
    this.validateProductSizes(parsedProduct);

    try {
      oldProduct = await this.productModel.findOne({ $and: findQuery });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.validatePatchRequest(req.method, oldProduct);
    this.validateDeleteRequest(req.method, oldProduct);

    reqdCategory = await this.validateProductCategory(parsedProduct);
    parsedProduct.slug = await this.validateAndParseProductSlug(parsedProduct);
    parsedProduct.images = await this.validateAndParseProductImages(parsedProduct);

    if (!oldProduct) {
      oldProduct = new this.productModel();
    }

    // attach to response
    res.locals.oldProduct = oldProduct;
    res.locals.product = parsedProduct;
    res.locals.productCategory = reqdCategory;

    next();
  }
}
