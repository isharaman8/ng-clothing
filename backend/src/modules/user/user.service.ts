// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { _getUserPayload } from 'src/helpers/user';
import {
  _getUidAggregationFilter,
  _getNameAggregationFilter,
  _getEmailAggregationFilter,
  _getUserNameAggregationFilter,
  _getActiveAggregationFilter,
} from 'src/helpers/aggregationFilters';
import { _getParsedUserResponsePayload } from 'src/helpers/parser';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers(query: any) {
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

    return payload;
  }
}
