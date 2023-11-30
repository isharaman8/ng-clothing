// third party imports
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { _getParsedParams, _getParsedUserBody } from 'src/helpers/parser';
import { CreateOrUpdateUserDto } from 'src/dto';

@Injectable()
export class ValidateUserMiddleware implements NestMiddleware {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getFindUserQuery(originalUrl: string, method: string, parsedUserBody: CreateOrUpdateUserDto, params: any) {
    let query: any;

    if ((originalUrl.includes('/signup') || originalUrl.includes('/login')) && method.toUpperCase() === 'POST') {
      query = [];

      if (parsedUserBody.email) {
        query.push({ email: parsedUserBody.email });
      }
      if (parsedUserBody.username) {
        query.push({ username: parsedUserBody.username });
      }
    }

    if (originalUrl.includes('/user') && method.toUpperCase() === 'PATCH') {
      query = [{ uid: params.userId }];
    }

    return query;
  }

  validateParsedUserBody(originalUrl: string, parsedUserBody: CreateOrUpdateUserDto) {
    if (
      (!(parsedUserBody.email || parsedUserBody.username) || !parsedUserBody.password) &&
      originalUrl.includes('/login')
    ) {
      throw new BadRequestException('email/username and password required for login');
    }

    if (
      (!parsedUserBody.email || !parsedUserBody.username || !parsedUserBody.password) &&
      originalUrl.includes('/signup')
    ) {
      throw new BadRequestException('email, password, and username required for signup');
    }
  }

  validateSignupRequest(originalUrl: string, oldUser: CreateOrUpdateUserDto) {
    if (originalUrl.includes('/signup') && oldUser) {
      throw new BadRequestException(`user with given email id and/or username already exists`);
    }
  }

  validateLoginRequest(originalUrl: string, oldUser: CreateOrUpdateUserDto, parsedUserBody: CreateOrUpdateUserDto) {
    if (originalUrl.includes('/login')) {
      if (!oldUser) {
        throw new BadRequestException('incorrect email/password');
      }

      const checkPassword = bcrypt.compareSync(parsedUserBody.password, oldUser.password);

      if (!checkPassword) {
        throw new BadRequestException('incorrect email/password');
      }
    }
  }

  validateUserUpdateRequest(
    originalUrl: string,
    method: string,
    oldUser: CreateOrUpdateUserDto | undefined,
    params: any,
  ) {
    if (originalUrl.includes('user') && method.toUpperCase() === 'PATCH') {
      if (!oldUser) {
        throw new BadRequestException(`user with given uid: ${params.userId} does not exists`);
      }
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    let { user = {} } = req.body;

    const params = _getParsedParams(req.params);
    const parsedUserBody = _getParsedUserBody(user);
    const query = this.getFindUserQuery(req.originalUrl, req.method, parsedUserBody, params);

    this.validateParsedUserBody(req.originalUrl, parsedUserBody);

    let oldUser: any = await this.userModel.find({ $or: query });
    oldUser = oldUser[0];

    this.validateSignupRequest(req.originalUrl, oldUser);

    this.validateLoginRequest(req.originalUrl, oldUser, parsedUserBody);

    this.validateUserUpdateRequest(req.originalUrl, req.method, oldUser, params);

    if (!oldUser) {
      oldUser = new this.userModel();
    }

    // attach to response
    res.locals.oldUser = oldUser;

    next();
  }
}
