// Third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// Inner imports
import { _getParsedQuery } from 'src/helpers/parser';
import { Product } from 'src/schemas/product.schema';

@Injectable()
export class SharedProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async bulkUpdateOp(bulkUpdateArray: Array<any>) {
    try {
      if (!_.isEmpty(bulkUpdateArray)) {
        await this.productModel.bulkWrite(bulkUpdateArray);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
