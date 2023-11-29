// third party imports
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
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
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let { user = {} } = req.body;

    const params = _getParsedParams(req.params);
    const parsedUserBody = _getParsedUserBody(user);

    let oldUser: any;

    let query: any;

    if (
      (req.originalUrl.includes('/signup') ||
        req.originalUrl.includes('/login')) &&
      req.method.toUpperCase() === 'POST'
    ) {
      if (
        (!(parsedUserBody.email || parsedUserBody.username) ||
          !parsedUserBody.password) &&
        req.originalUrl.includes('/login')
      ) {
        throw new BadRequestException(
          'email/username and password required for login',
        );
      }

      if (
        (!parsedUserBody.email ||
          !parsedUserBody.username ||
          !parsedUserBody.password) &&
        req.originalUrl.includes('/signup')
      ) {
        throw new BadRequestException(
          'email, password, and username required for signup',
        );
      }

      query = [];

      if (parsedUserBody.email) {
        query.push({ email: parsedUserBody.email });
      }
      if (parsedUserBody.username) {
        query.push({ username: parsedUserBody.username });
      }
    }

    if (
      req.originalUrl.includes('/user') &&
      req.method.toUpperCase() === 'PATCH'
    ) {
      query = [{ uid: params.userId }];
    }

    oldUser = await this.userModel.find({ $or: query });

    // validate for signup request
    if (req.originalUrl.includes('/signup') && oldUser.length) {
      throw new BadRequestException(
        `user with given email id and/or username already exists`,
      );
    }

    // validate for login request
    if (req.originalUrl.includes('/login')) {
      if (!oldUser.length) {
        throw new BadRequestException('user not found');
      }

      console.log('PARSED USER BODY', parsedUserBody);
      console.log('OLD USER', oldUser);

      const checkPassword = bcrypt.compareSync(
        parsedUserBody.password,
        oldUser.password,
      );

      if (!checkPassword) {
        throw new BadRequestException('user not found');
      }
    }

    // validate for update user request
    if (
      req.originalUrl.includes('user') &&
      req.method.toUpperCase() === 'PATCH'
    ) {
      if (!oldUser.length) {
        throw new BadRequestException(
          `user with given uid: ${params.userId} does not exists`,
        );
      }

      // adding uid for update request
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
