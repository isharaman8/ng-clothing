// third party imports
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { User } from 'src/schemas/user.schema';
import { _getUserPayload } from 'src/helpers/user';
import {
  _getUidAggregationFilter,
  _getNameAggregationFilter,
  _getEmailAggregationFilter,
  _getUserNameAggregationFilter,
} from 'src/helpers/aggregationFIlters';
import { _getParsedUserResponsePayload } from 'src/helpers/parser';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers(query: any) {
    const andQuery = [
      ..._getUserNameAggregationFilter(query),
      ..._getEmailAggregationFilter(query),
      ..._getNameAggregationFilter(query),
      ..._getUidAggregationFilter(query),
    ];
    const baseQuery = [];

    if (!andQuery.length) {
      throw new BadRequestException(
        'finding users required at least one filter',
      );
    }

    baseQuery.push({ $match: { $and: andQuery } });

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

    return _getParsedUserResponsePayload(payload);
  }
}
