// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import {
  _getUidAggregationFilter,
  _getNameAggregationFilter,
  _getEmailAggregationFilter,
  _getUserNameAggregationFilter,
  _getActiveAggregationFilter,
} from 'src/helpers/aggregationFilters';
import { QueryParams } from 'src/interfaces';
import { User } from 'src/schemas/user.schema';
import { CreateOrUpdateUserDto } from 'src/dto';
import { parseArray, parseBoolean } from 'src/utils';
import { SharedService } from '../shared/shared.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private sharedService: SharedService,
  ) {}

  async getAllUsers(query: QueryParams, projection: any = {}) {
    const baseQuery: any = [
      {
        $match: {
          $and: [
            ..._getActiveAggregationFilter(query),
            ..._getUidAggregationFilter(query),
            ..._getUserNameAggregationFilter(query),
            ..._getEmailAggregationFilter(query),
            ..._getNameAggregationFilter(query),
          ],
        },
      },
    ];

    if (!_.isEmpty(projection)) {
      baseQuery.push({ $project: projection });
    }

    console.log('BASE QUERY', JSON.stringify(baseQuery));

    let users = [];

    try {
      users = await this.userModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return users;
  }

  async createOrUpdateUser(user: any, oldUser: any) {
    const payload = this.getCreateOrUpdateUserPayload(user, oldUser);

    try {
      await this.userModel.updateOne({ uid: payload.uid }, payload, {
        upsert: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  async getUpdatedProfilePictureUrl(users: Array<CreateOrUpdateUserDto>) {
    const profilePictureUids = _.compact(_.map(users, (user) => user.profile_picture));

    let dbProfilePictures = [];

    try {
      dbProfilePictures = await this.sharedService.getUpdatedDbImageArray(profilePictureUids);

      // parsing user response;
      for (const user of users) {
        if (user.profile_picture) {
          const reqdImage = _.find(dbProfilePictures, (image) => image.uid === user.profile_picture);

          if (reqdImage) {
            user['profile_picture'] = reqdImage.url;
          }
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return users;
  }

  getParsedUserBody(body: CreateOrUpdateUserDto) {
    const { uid, name, email, roles, password, active, username, profile_picture } = body;

    const payload: any = {
      uid: _.defaultTo(uid, null),
      name: _.defaultTo(name, null),
      roles: parseArray(roles, null),
      email: _.defaultTo(email, null),
      active: parseBoolean(active, true),
      username: _.defaultTo(username, null),
      password: _.defaultTo(password, null),
      profile_picture: _.defaultTo(profile_picture, null),
    };

    if (password) {
      const saltRounds = 8;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      // additional property of hashed_password
      payload.hashed_password = hashedPassword;
    }

    if (!payload.roles) {
      payload.roles = ['user'];
    }

    return payload;
  }

  getParsedUserResponsePayload(user: any = {}) {
    user = JSON.parse(JSON.stringify(user));

    // delete unnecessary properties
    delete user.$setOnInsert;
    delete user._id;
    delete user.__v;
    delete user.password;
    delete user.active;
    delete user.roles;
    delete user.created_at;
    delete user.updated_at;

    return user;
  }

  getCreateOrUpdateUserPayload(user: any = {}, oldUser: any = {}): CreateOrUpdateUserDto {
    const payload = {
      active: parseBoolean(user.active, true),
      uid: _.defaultTo(oldUser.uid, nanoid()),
      name: _.defaultTo(user.name, oldUser.name),
      email: _.defaultTo(user.email, oldUser.email),
      roles: parseArray(user.roles, oldUser.roles),
      username: _.defaultTo(user.username, oldUser.username),
      password: _.defaultTo(user.hashed_password, oldUser.password),
      profile_picture: _.defaultTo(user.profile_picture, oldUser.profile_picture),
    };

    return payload;
  }
}
