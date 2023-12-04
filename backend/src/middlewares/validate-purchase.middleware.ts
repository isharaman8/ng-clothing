// third party imports
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NestMiddleware } from '@nestjs/common';

// inner imports
import { _notEmpty } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';
import { Purchase } from 'src/schemas/purchase.schema';

@Injectable()
export class ValidateProductMiddleware implements NestMiddleware {
  constructor(@InjectModel(Purchase.name) private purchaseModel: Model<Purchase>) {}

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    // attach to response

    next();
  }
}
