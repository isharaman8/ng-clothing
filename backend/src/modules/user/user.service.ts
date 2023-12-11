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
import { S3Service } from '../s3/s3.service';
import { User } from 'src/schemas/user.schema';
import { CreateOrUpdateUserDto } from 'src/dto';
import { parseArray, parseBoolean } from 'src/utils';
import { QueryParams, S3GetUrlArray, UploadedImage } from 'src/interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private s3Service: S3Service,
  ) {}

  async getAllUsers(query: QueryParams) {
    const baseQuery = [
      {
        $match: {
          $and: [
            ..._getUserNameAggregationFilter(query),
            ..._getEmailAggregationFilter(query),
            ..._getNameAggregationFilter(query),
            ..._getUidAggregationFilter(query),
            ..._getActiveAggregationFilter(query),
          ],
        },
      },
    ];

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
    const s3Array: Array<S3GetUrlArray> = [];

    let dbProfilePictures = [];
    let updatedFileUrls = [];

    try {
      dbProfilePictures = await this.s3Service.getAllUploads(profilePictureUids);

      // filtering to be updated users
      for (const user of users) {
        if (user.profile_picture) {
          const reqdProfilePicture = _.find(dbProfilePictures, (picture) => picture.uid === user.profile_picture);

          if (reqdProfilePicture) {
            const prevTime = new Date(reqdProfilePicture.urlExpiryDate),
              currentTime = new Date();

            if (currentTime >= prevTime) {
              s3Array.push({
                uid: reqdProfilePicture.uid,
                bucket: reqdProfilePicture.bucket,
                key: reqdProfilePicture.key,
                service_uid: user.uid,
              });
            }
          }
        }
      }

      // fetching updated image objs
      if (s3Array.length) {
        updatedFileUrls = await this.s3Service.getUpdatedFileUrls(s3Array);
      }

      // updating dbArray
      for (const url of updatedFileUrls) {
        const reqdImageIdx = _.findIndex(dbProfilePictures, (image) => image.uid === url.uid);

        if (reqdImageIdx !== -1) {
          const oldProfilePictureObj: UploadedImage = dbProfilePictures[reqdImageIdx],
            newProfilePicture: UploadedImage = {
              ...JSON.parse(JSON.stringify(oldProfilePictureObj)),
              url: url.url,
              urlExpiryDate: url.urlExpiryDate,
            };

          dbProfilePictures[reqdImageIdx] = newProfilePicture;
        }
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
