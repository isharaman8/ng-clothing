// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { Product } from 'src/schemas/product.schema';
import { _getParsedParams, _getParsedProductBody, _getParsedUserBody } from 'src/helpers/parser';

@Injectable()
export class ValidateProductMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(User.name) private productModel: Model<Product>,
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    const {
      body: { product = {} },
      user = {},
    } = req;
    const params = _getParsedParams(req.params);
    const parsedProductBody = _getParsedProductBody(product);

    // attach to response

    next();
  }
}
