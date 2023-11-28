// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { _getUserPayload } from 'src/helpers/user';
import {
  _getEmailAggregationFilter,
  _getNameAggregationFilter,
  _getUserNameAggregationFilter,
} from 'src/helpers/aggregationFIlters';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers(query: any) {
    const andQuery = [
      ..._getUserNameAggregationFilter(query),
      ..._getEmailAggregationFilter(query),
      ..._getNameAggregationFilter(query),
    ];
    const baseQuery = [];

    if (andQuery.length) {
      baseQuery.push({ $match: { $and: andQuery } });
    }

    console.log('USER QUERY', baseQuery);

    let users = [];

    try {
      users = await this.userModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return users;
  }

  async createOrUpdateUser(user: any, oldUser: any) {
    const payload = _getUserPayload(user, oldUser);

    try {
      await this.userModel.updateOne({ uid: payload.uid }, payload, {
        upsert: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return JSON.parse(JSON.stringify(payload));
  }
}
