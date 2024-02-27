// third party imports
import * as _ from 'lodash';
import slugify from 'slugify';
import { NextFunction } from 'express';
import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

// inner imports
import { CreateOrUpdateProductDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { S3Service } from 'src/modules/s3/s3.service';
import { _notEmpty, parseArray, parseObject } from 'src/utils';
import { ProductService } from 'src/modules/product/product.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { CategoryService } from 'src/modules/category/category.service';
import { ALLOWED_PRODUCT_SIZES, ALLOWED_USER_ROLES } from 'src/constants/constants';

@Injectable()
export class ValidateProductMiddleware implements NestMiddleware {
  constructor(
    private productService: ProductService,
    private uploadService: S3Service,
    private categoryService: CategoryService,
  ) {}

  private validateUserRole(user: any) {
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

  private validateDeleteAndPatchRequest(
    method: string,
    oldProducts: Array<CreateOrUpdateProductDto>,
    productUid: string,
    products: Array<Partial<CreateOrUpdateProductDto>>,
  ) {
    if (method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'DELETE') {
      if (productUid) {
        if (!_.some(oldProducts, (oldProduct) => oldProduct.uid === productUid)) {
          throw new BadRequestException(`Products with given uids ${productUid} not found`);
        }

        if (products.length > 1 && method.toUpperCase() === 'PATCH') {
          throw new BadRequestException('please provide one object to update');
        }
      }

      if (!productUid && _.some(products, (product) => !product.uid)) {
        throw new BadRequestException('please provide product uid');
      }

      const allProductUids = _.compact(_.map(products, (product) => product.uid));
      const allOldProductUids = _.map(oldProducts, (oldProduct) => oldProduct.uid);
      const productNotFoundUids = _.filter(allProductUids, (uid) => !_.includes(allOldProductUids, uid));

      if (!_.isEmpty(productNotFoundUids)) {
        throw new NotFoundException(`Products with given uids ${_.join(productNotFoundUids, ', ')} not found`);
      }

      return true;
    }
  }

  private validatePostRequest(method: string, products: Array<CreateOrUpdateProductDto>) {
    if (method.toUpperCase() === 'POST' && _.some(products, (product) => !product.user_id)) {
      throw new UnauthorizedException('user_id required to create product');
    }
  }

  private async validateAndParseProductSlug(products: Array<Partial<CreateOrUpdateProductDto>>) {
    const updatedProducts = [];
    const slugUidsToCheck = [];

    let existingSlugs = [];

    for (const product of products) {
      if (product.name) {
        const slug = slugify(product.name).toLowerCase();

        slugUidsToCheck.push(slug);
        updatedProducts.push({ ...product, slug });
      } else {
        updatedProducts.push(product);
      }
    }

    const duplicateSlugObj = _.groupBy(slugUidsToCheck);
    const filteredDuplicateSlugs = _.uniq(_.flatten(_.filter(duplicateSlugObj, (element) => element.length > 1)));

    if (!_.isEmpty(filteredDuplicateSlugs)) {
      throw new BadRequestException(`duplicate slugs not allowed ${_.join(filteredDuplicateSlugs, ', ')}`);
    }

    // Query the database for existing slugs
    if (!_.isEmpty(slugUidsToCheck)) {
      // ? changed it to use product service - test
      const reqdSlugQuery = _getParsedQuery({ slug: slugUidsToCheck });
      reqdSlugQuery['active'] = null;

      existingSlugs = await this.productService.getAllProducts(reqdSlugQuery);
    }

    for (const product of updatedProducts) {
      if (product.name) {
        const slug = slugify(product.name).toLowerCase();
        const existingSlug = _.find(existingSlugs, (existing) => existing.slug === slug);

        if (existingSlug && existingSlug.uid !== product.uid) {
          throw new BadRequestException(`Slug for product '${product.name}' already exists`);
        }
      }
    }

    return updatedProducts;
  }

  private async validateProductCategoryAndPopulateCategoryData(
    products: Array<Partial<CreateOrUpdateProductDto>>,
    oldProducts: Array<CreateOrUpdateProductDto>,
  ) {
    let reqdCategories = [];

    const categoryUids = _.uniq(
      _.compact([
        ..._.map(products, (product) => product.category),
        ..._.map(oldProducts, (oldProduct) => oldProduct.category),
      ]),
    );

    if (_.isEmpty(categoryUids)) {
      return reqdCategories;
    }

    const query = _getParsedQuery({ uid: categoryUids });

    reqdCategories = await this.categoryService.getAllCategories(query);

    const notFoundCategoryUids = _.filter(
      categoryUids,
      (uid) => !_.some(reqdCategories, (category) => category.uid === uid),
    );

    if (!_.isEmpty(notFoundCategoryUids)) {
      throw new NotFoundException(`categories with given uids ${_.join(notFoundCategoryUids, ', ')} does not exists`);
    }

    reqdCategories = _.map(reqdCategories, (category) =>
      _.pick(parseObject(category, {}), ['uid', 'name', 'description', 'slug']),
    );

    // populate category_name and category_description in payload
    _.forEach(products, (product) => {
      if (_.isEmpty(product.category)) {
        return;
      }

      const reqdCategory = _.find(reqdCategories, (category) => category.uid === product.category);

      if (_.isEmpty(reqdCategory)) {
        return;
      }

      product['category_name'] = reqdCategory.name;
      product['category_description'] = reqdCategory.description;
    });

    return reqdCategories;
  }

  private async validateAndParseProductImages(products: Array<Partial<CreateOrUpdateProductDto>>) {
    const imageUids = _.flatMap(products, (product) => parseArray(product.images, []));
    const uploadQuery = _getParsedQuery({ uid: imageUids });

    let uploads = [];

    if (_.isEmpty(imageUids)) {
      return { products, uploadedImages: uploads };
    }

    uploads = await this.uploadService.getAllUploads(uploadQuery);

    for (const product of products) {
      if (_.isEmpty(product.images)) {
        continue;
      }

      const updateImageUids = _.filter(product.images, (imageUid) =>
        _.some(uploads, (upload) => upload.uid === imageUid),
      );

      product['images'] = updateImageUids;
    }

    return { products, uploadedImages: uploads };
  }

  private validateProductSizes(products: Array<Partial<CreateOrUpdateProductDto>>) {
    if (_.every(products, (product) => _.isEmpty(product.available_sizes))) {
      return true;
    }

    const validSizes = _.keys(ALLOWED_PRODUCT_SIZES);

    for (const product of products) {
      const providedSizes = _.keys(product.available_sizes);
      const invalidSizes = _.filter(providedSizes, (size) => !_.includes(validSizes, size));

      if (!_.isEmpty(invalidSizes)) {
        throw new BadRequestException(`invalid sizes provided: ${_.join(invalidSizes, ', ')}`);
      }
    }
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { products: _products = [] },
    } = req;

    const params = _getParsedParams(req.params);
    const products = parseArray(_products, [_products]);
    const findProductUids = _.compact([params.productId, ..._.map(products, (product) => product.uid)]);
    const findQuery = _getParsedQuery({ uid: findProductUids, user_id: user.uid });

    let oldProducts: any = [];
    let reqdCategories: any = [];
    let uploadedImages: any = [];
    let parsedProducts = _.map(products, (product) => this.productService.getParsedProductBody(product, user));

    findQuery['active'] = null;

    this.validateUserRole(user);
    this.validatePostRequest(req.method, parsedProducts);
    this.validateProductSizes(parsedProducts);

    if (!_.isEmpty(findProductUids)) {
      oldProducts = await this.productService.getAllProducts(findQuery);
    }

    this.validateDeleteAndPatchRequest(req.method, oldProducts, params.productId, parsedProducts);

    // populate uid in product
    if (params.productId) {
      parsedProducts = _.map(parsedProducts, (product) => ({ ...product, uid: params.productId }));
    }

    reqdCategories = await this.validateProductCategoryAndPopulateCategoryData(parsedProducts, oldProducts);
    parsedProducts = await this.validateAndParseProductSlug(parsedProducts);

    const { products: tempImageProducts, uploadedImages: tempUploadedImages } =
      await this.validateAndParseProductImages(parsedProducts);
    parsedProducts = tempImageProducts;
    uploadedImages = tempUploadedImages;

    // attach to response
    res.locals.oldProducts = oldProducts;
    res.locals.products = parsedProducts;
    res.locals.uploadedImages = uploadedImages;
    res.locals.productCategories = reqdCategories;

    next();
  }
}
