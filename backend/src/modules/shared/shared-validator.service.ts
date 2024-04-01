// Third party imports
import * as _ from 'lodash';
import { BadRequestException, Injectable } from '@nestjs/common';

// Inner imports
import { parseObject } from 'src/utils';
import { BodyProduct } from 'src/interfaces';
import { _getParsedQuery } from 'src/helpers/parser';
import { ProductService } from '../product/product.service';
import { ALLOWED_PRODUCT_SIZES } from 'src/constants/constants';

@Injectable()
export class SharedValidatorService {
  constructor(private productService: ProductService) {}

  private parseAddRemoveProducts(products: any, oldProducts: Array<BodyProduct>) {
    if (
      Array.isArray(products.products) &&
      !products.products_add &&
      !products.products_remove &&
      !products.products_modify
    ) {
      return products.products;
    }

    const { products_add = [], products_remove = [], products_modify = [] } = products;
    const newProducts: Array<any> = [];

    // parse added products
    for (const product of products_add) {
      const reqdProduct = _.find(oldProducts, (prd: any) => prd.uid === product.uid);

      if (!_.isEmpty(reqdProduct)) {
        reqdProduct.qty += _.defaultTo(product.qty, 1);
        newProducts.push(reqdProduct);
      } else {
        newProducts.push(product);
      }
    }

    // parse removed products
    for (const product of products_remove) {
      const reqdProduct = _.find(oldProducts, (prd: any) => prd.uid === product.uid);

      if (_.isEmpty(reqdProduct)) {
        continue;
      }

      reqdProduct.qty -= _.defaultTo(product.qty, 1);

      if (reqdProduct.qty >= 1) {
        newProducts.push(reqdProduct);
      }
    }

    // parse modified products (only change in size)
    for (const product of products_modify) {
      const reqdProduct = _.find(oldProducts, (prd: any) => prd.uid === product.uid);

      if (_.isEmpty(reqdProduct)) {
        continue;
      }

      reqdProduct.size = product.size;
      reqdProduct.qty = product.qty;

      newProducts.push(reqdProduct);
    }

    // parse not included products
    for (const product of oldProducts) {
      const checkOldProduct = _.every(newProducts, (prd) => prd.uid !== product.uid);

      if (checkOldProduct && product.qty >= 1) {
        newProducts.push(product);
      }
    }

    return newProducts;
  }

  // validators
  async validateAndParseProducts(_products: any, oldProducts: Array<BodyProduct>) {
    const productArray: any = this.parseAddRemoveProducts(_products, oldProducts);
    const productUids = _.compact(_.map(productArray, (product) => product.uid));
    const query = _getParsedQuery({ uid: productUids, page_size: productUids.length });
    const parsedProductArray = [];

    let products = [];

    if (productUids.length) {
      products = await this.productService.getAllProducts(query);
    }

    // validate if products exist
    for (const obj of productArray) {
      const reqdProduct = _.find(products, (product) => product.uid === obj.uid);
      const allowedProductKeys = _.keys(ALLOWED_PRODUCT_SIZES);

      if (!reqdProduct) {
        throw new BadRequestException('product not found');
      }

      if (!_.includes(allowedProductKeys, obj.size)) {
        throw new BadRequestException(`invalid product size ${obj.size}`);
      }

      if (obj.qty > (parseObject(reqdProduct.available_sizes, ALLOWED_PRODUCT_SIZES)[obj.size] || 0)) {
        throw new BadRequestException('product quantity shoudnt be greater than the one available');
      }
    }

    // get parsed products
    for (const product of products) {
      const reqdPayloadProduct = _.find(productArray, (prd) => prd.uid === product.uid);

      parsedProductArray.push({
        uid: product.uid,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        qty: reqdPayloadProduct.qty,
        size: reqdPayloadProduct.size,
        available_sizes: product.available_sizes,
      });
    }

    return parsedProductArray;
  }
}
