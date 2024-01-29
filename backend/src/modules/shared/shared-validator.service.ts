// Third party imports
import * as _ from 'lodash';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

// Inner imports
import { BodyProduct } from 'src/interfaces';
import { _getParsedQuery } from 'src/helpers/parser';
import { ProductService } from '../product/product.service';

@Injectable()
export class SharedValidatorService {
  constructor(private productService: ProductService) {}

  // validators
  async validateAndParseProducts(productArray: Array<BodyProduct>) {
    const productUids = _.compact(_.map(productArray, (product) => product.uid));
    const query = _getParsedQuery({ uid: productUids });
    const parsedProductArray = [];

    let products = [];

    try {
      if (productUids.length) {
        products = await this.productService.getAllProducts(query);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // validate if products exist
    for (const uid of productUids) {
      const reqdProduct = _.find(products, (product) => product.uid === uid);

      if (!reqdProduct) {
        throw new BadRequestException('product not found');
      }
    }

    // get parsed products
    for (const product of products) {
      const reqdPayloadProduct = _.find(productArray, (prd) => prd.uid === product.uid);

      parsedProductArray.push({
        uid: product.uid,
        name: product.name,
        price: product.price,
        images: product.images,
        qty: reqdPayloadProduct.qty,
      });
    }

    return parsedProductArray;
  }
}
