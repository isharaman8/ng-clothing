// third party imports
import * as _ from 'lodash';
import { NextFunction } from 'express';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';
import { _getParsedParams } from 'src/helpers/parser';
import { ALLOWED_USER_ROLES } from 'src/constants/constants';

@Injectable()
export class ValidateUploadMiddleware implements NestMiddleware {
  validateUploadPostRequest(user: any = {}) {
    let isValid = false;

    for (const role of parseArray(user.roles, [])) {
      if (_.includes(ALLOWED_USER_ROLES.upload, role)) {
        isValid = true;
      }
    }

    if (!isValid) {
      throw new UnauthorizedException(`only ${_.join(ALLOWED_USER_ROLES.upload, ', ')}  can upload files`);
    }
  }

  async use(req: CRequest, _res: CResponse, next: NextFunction) {
    const user = req.user;

    this.validateUploadPostRequest(user);

    next();
  }
}
