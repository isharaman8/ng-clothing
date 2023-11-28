// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { _getParsedUserBody } from 'src/helpers/parser';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ValidateUserMiddleware implements NestMiddleware {
  constructor(
    private userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { user = {} } = req.body;
    const params = req.params;
    const parsedUserBody = _getParsedUserBody(user);

    let oldUser: any;

    // adding uid for update request
    if (params.user_uid) {
      oldUser = await this.userService.getAllUsers({ uid: params.uid });

      if (oldUser.length) {
        parsedUserBody.uid = params.user_uid;

        oldUser = user[0];
      }
    }

    if (!oldUser) {
      oldUser = new this.userModel();
    }

    // attach to response
    res.locals.payload = parsedUserBody;
    res.locals.oldUser = oldUser;

    next();
  }
}
