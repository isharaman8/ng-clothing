// third party imports
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { CreateOrUpdateUserDto } from 'src/dto';
import { _notEmpty, parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';
import { UserService } from 'src/modules/user/user.service';
import { ALLOWED_USER_ROLES } from 'src/constants/constants';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';

@Injectable()
export class ValidateUserMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private userService: UserService,
  ) {}

  private validateUserRole(user: any = {}, method: string, originalUrl: string) {
    let validUserRole = false;

    const allowedOriginsWithoutCheck = ['/auth/login', '/auth/signup'];

    const roles = parseArray(user.roles, []);

    if (method.toUpperCase() === 'PATCH' || _.includes(allowedOriginsWithoutCheck, originalUrl)) {
      validUserRole = true;
    }

    for (const role of roles) {
      if (_.includes(ALLOWED_USER_ROLES.user, role) && method.toUpperCase() === 'POST') {
        validUserRole = true;
      }
    }

    if (!validUserRole) {
      throw new UnauthorizedException('not authorized for creating users');
    }
  }

  private validateParsedUserBody(originalUrl: string, parsedUserBody: CreateOrUpdateUserDto) {
    if (
      (!(parsedUserBody.email || parsedUserBody.username) || !parsedUserBody.password) &&
      _.includes(originalUrl, '/login')
    ) {
      throw new BadRequestException('email/username and password required for login');
    }

    if (
      (!parsedUserBody.email || !parsedUserBody.username || !parsedUserBody.password) &&
      _.includes(originalUrl, '/signup')
    ) {
      throw new BadRequestException('email, password, and username required for signup');
    }
  }

  private validateSignupRequest(originalUrl: string, oldUser: CreateOrUpdateUserDto) {
    if (_.includes(originalUrl, '/signup') && oldUser) {
      throw new BadRequestException(`user with given email id and/or username already exists`);
    }
  }

  private validateLoginRequest(
    originalUrl: string,
    oldUser: CreateOrUpdateUserDto,
    parsedUserBody: CreateOrUpdateUserDto,
  ) {
    if (_.includes(originalUrl, '/login')) {
      if (!oldUser) {
        throw new BadRequestException('incorrect email/password');
      }

      const checkPassword = bcrypt.compareSync(parsedUserBody.password, oldUser.password);

      if (!checkPassword) {
        throw new BadRequestException('incorrect email/password');
      }
    }
  }

  private validateUserUpdateRequest(
    originalUrl: string,
    method: string,
    oldUser: CreateOrUpdateUserDto | undefined,
    params: any,
    user: any = {},
  ) {
    if (_.includes(originalUrl, 'user') && method.toUpperCase() === 'PATCH') {
      if (!oldUser) {
        throw new BadRequestException(`user with given uid: ${params.userId} does not exists`);
      }

      if (
        !oldUser.uid === user.uid &&
        !_.some(parseArray(user.roles, []), (role: string) => _.includes(ALLOWED_USER_ROLES.user, role))
      ) {
        throw new UnauthorizedException(`only to be updated user or admin can update a user`);
      }
    }
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const { user = {} } = req.body;
    const params = _getParsedParams(req.params);
    const parsedUserBody = this.userService.getParsedUserBody(user);
    const findQuery = _getParsedQuery({
      email: parsedUserBody.email,
      username: parsedUserBody.username,
      uid: params.userId,
    });

    let oldUser: any;

    findQuery['active'] = null;

    this.validateUserRole(req.user, req.method, req.originalUrl);
    this.validateParsedUserBody(req.originalUrl, parsedUserBody);

    const tempUser = await this.userService.getAllUsers(findQuery);

    oldUser = _.last(tempUser);

    this.validateSignupRequest(req.originalUrl, oldUser);
    this.validateLoginRequest(req.originalUrl, oldUser, parsedUserBody);
    this.validateUserUpdateRequest(req.originalUrl, req.method, oldUser, params, user);

    if (!oldUser) {
      oldUser = new this.userModel();
    }

    // attach to response
    res.locals.oldUser = oldUser;

    next();
  }
}
