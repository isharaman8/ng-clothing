// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { UserService } from 'src/modules/user/user.service';
import { _getParsedParams, _getParsedUserBody } from 'src/helpers/parser';

@Injectable()
export class ValidateUserMiddleware implements NestMiddleware {
  constructor(
    private userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let { user = {} } = req.body;

    const params = _getParsedParams(req.params);
    const parsedUserBody = _getParsedUserBody(user);

    let oldUser: any;

    // adding uid for update request
    if (params.userId && req.method.toUpperCase() === 'PATCH') {
      const query = { userId: params.userId };

      oldUser = await this.userService.getAllUsers(query);

      if (!oldUser.length) {
        throw new BadRequestException(
          `user with given uid: ${params.userId} does not exists`,
        );
      }

      parsedUserBody.uid = params.userId;

      oldUser = oldUser[0];
    }

    if (!oldUser) {
      oldUser = new this.userModel();
    }

    // attach to response
    res.locals.oldUser = oldUser;

    next();
  }
}
