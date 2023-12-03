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
import { User } from 'src/schemas/user.schema';
import { _notEmpty, parseArray } from 'src/utils';
import { CreateOrUpdateProductDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
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

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { product = {} },
    } = req;
    const params = _getParsedParams(req.params);
    const parsedProduct = _getParsedProductBody(product, user);
    const findQuery = _.filter([{ uid: params.productId }, { user_id: user.uid }], _notEmpty);

    console.log('FIND QUERY', JSON.stringify(findQuery));

    this.validateUserRole(user);

    this.validatePostRequest(req.method, parsedProduct);

    let oldProduct: any;

    try {
      oldProduct = await this.productModel.findOne({ $or: findQuery });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.validatePatchRequest(req.method, oldProduct);

    this.validateDeleteRequest(req.method, oldProduct);

    if (!oldProduct) {
      oldProduct = new this.productModel();
    }

    // attach to response
    res.locals.oldProduct = oldProduct;

    next();
  }
}
