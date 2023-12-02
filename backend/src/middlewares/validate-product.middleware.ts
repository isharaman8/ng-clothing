// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Response, NextFunction } from 'express';
import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { parseArray } from 'src/utils/general';
import { Product } from 'src/schemas/product.schema';
import { ALLOWED_USER_ROLES } from 'src/constants/constants';
import { _getParsedParams, _getParsedProductBody, _getParsedUserBody } from 'src/helpers/parser';

@Injectable()
export class ValidateProductMiddleware implements NestMiddleware {
  constructor(@InjectModel(User.name) private productModel: Model<Product>) {}

  validateUserRole(user: any) {
    let validUserRole = false;

    const roles = parseArray(user.roles, []);

    for (const role of roles) {
      if (ALLOWED_USER_ROLES.product.includes(role)) {
        validUserRole = true;
      }
    }

    if (!validUserRole) {
      throw new UnauthorizedException('not authorized for creating/updating a product');
    }
  }

  validatePatchRequest(method: string, oldProduct: any) {
    if (method.toUpperCase() === 'PATCH' && !oldProduct) {
      throw new NotFoundException('product not found');
    }
  }

  async use(req: any, res: Response, next: NextFunction) {
    const { user = {} } = req;
    const params = _getParsedParams(req.params);

    console.log('PARAMS', params);

    const findQuery = [{ uid: params.productId }, { user_id: user.uid }];

    this.validateUserRole(user);

    let oldProduct: any;

    try {
      console.log('OR QUERY', JSON.stringify(findQuery));

      oldProduct = await this.productModel.findOne({ $or: findQuery });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.validatePatchRequest(req.method, oldProduct);

    if (!oldProduct) {
      oldProduct = new this.productModel();
    }

    // attach to response
    res.locals.oldProduct = oldProduct;

    next();
  }
}
