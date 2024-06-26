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
  _getActiveAggregationFilter,
  _getUserNameAggregationFilter,
} from 'src/helpers/aggregationFilters';
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

  async getAllUsers(query: any = {}, projection: any = {}) {
    const orBlock = [..._getUserNameAggregationFilter(query), ..._getEmailAggregationFilter(query)];
    const andBlock = [
      ..._getActiveAggregationFilter(query),
      ..._getUidAggregationFilter(query),
      ..._getNameAggregationFilter(query),
    ];

    if (!_.isEmpty(orBlock)) {
      andBlock.push({ $or: orBlock });
    }

    const baseQuery: any = [{ $match: { $and: andBlock } }];

    if (query.addresses) {
      baseQuery.push({
        $lookup: {
          from: 'useraddresses',
          let: { userId: '$uid' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$user_id', '$$userId'] }, { $eq: ['$active', true] }],
                },
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ],
          as: 'user_addresses',
        },
      });
    }

    if (!_.isEmpty(projection)) {
      baseQuery.push({ $project: projection });
    }

    console.log('USER AGGREGATION QUERY', JSON.stringify(baseQuery));

    let users = [];

    try {
      users = await this.userModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return users;
  }

  async createOrUpdateUser(user: any, oldUser: any) {
    if (!oldUser.uid) {
      // todo: set it to false after sendgrid verification
      user['is_verified'] = true;
    }

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

  async getUpdatedProfilePictureUrl(users: Array<CreateOrUpdateUserDto>, uploads: any = []) {
    const profilePictureUids = _.compact(_.map(users, (user) => user.profile_picture));

    let dbProfilePictures = uploads;

    if (_.isEmpty(dbProfilePictures)) {
      dbProfilePictures = await this.sharedService.getUpdatedDbImageArray(profilePictureUids);
    }

    // parsing user response;
    for (const user of users) {
      if (user.profile_picture) {
        const reqdImage = _.find(dbProfilePictures, (image) => image.uid === user.profile_picture);

        if (reqdImage) {
          user['profile_picture'] = reqdImage.url;
        }
      }
    }

    return users;
  }

  getParsedUserBody(body: any) {
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
      email: _.defaultTo(oldUser.email, user.email),
      roles: parseArray(user.roles, oldUser.roles),
      username: _.defaultTo(oldUser.username, user.username),
      password: _.defaultTo(user.hashed_password, oldUser.password),
      is_verified: parseBoolean(user.is_verified, oldUser.is_verified) || false,
      profile_picture: _.defaultTo(user.profile_picture, oldUser.profile_picture),
    };

    return payload;
  }
}
