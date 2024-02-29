// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { parseBoolean, parseNumber } from 'src/utils';
import { CreateOrUpdateUserAddressDto } from 'src/dto';
import { UserAddress } from 'src/schemas/user-address.schema';
import { _getActiveAggregationFilter, _getUidAggregationFilter } from 'src/helpers/aggregationFilters';

@Injectable()
export class UserAddressService {
  constructor(@InjectModel(UserAddress.name) private userAddressModel: Model<UserAddress>) {}

  async createOrUpdateUserAddress(address: any = {}, oldAddress: any = {}, user: any = {}) {
    const payload = this.getCreateOrUpdateUserAddressPayload(address, oldAddress, user);

    try {
      await this.userAddressModel.updateOne({ uid: payload.uid }, payload, {
        upsert: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  async getAllUserAddresses(query: any = {}) {
    let userAddresses = [];

    const andQuery = [..._getUidAggregationFilter(query), ..._getActiveAggregationFilter(query)];
    const baseQuery = [{ $match: { $and: andQuery } }];

    if (_.isEmpty(andQuery)) {
      return userAddresses;
    }

    try {
      userAddresses = await this.userAddressModel.aggregate(baseQuery);

      console.log('USER ADDRESS BASE QUERY', JSON.stringify(baseQuery));
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return userAddresses;
  }

  async deleteUserAddress(addressUid: string) {
    try {
      await this.userAddressModel.updateOne({ uid: addressUid }, { active: false });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }

  getCreateOrUpdateUserAddressPayload(
    address: Partial<CreateOrUpdateUserAddressDto> = {},
    oldAddress: Partial<CreateOrUpdateUserAddressDto> = {},
    user: any = {},
  ): CreateOrUpdateUserAddressDto {
    const payload = {
      user_id: user.uid,
      uid: _.defaultTo(oldAddress.uid, nanoid()),
      city: _.defaultTo(address.city, oldAddress.city),
      type: _.defaultTo(address.type, oldAddress.type),
      country: _.defaultTo(address.country, oldAddress.country),
      user_name: _.defaultTo(address.user_name, oldAddress.user_name),
      active: parseBoolean(address.active, oldAddress.active) || true,
      primary: parseBoolean(address.primary, oldAddress.primary) || false,
      postal_code: parseNumber(address.postal_code, oldAddress.postal_code),
      contact_number: _.defaultTo(address.contact_number, oldAddress.contact_number),
      address_line_1: _.defaultTo(address.address_line_1, oldAddress.address_line_1),
      address_line_2: _.defaultTo(address.address_line_2, oldAddress.address_line_2),
      state_province: _.defaultTo(address.state_province, oldAddress.state_province),
    };

    return payload;
  }

  getParsedUserAddressBody(address: Partial<CreateOrUpdateUserAddressDto> = {}, user: any = {}) {
    const {
      city,
      type,
      active,
      primary,
      country,
      user_name,
      postal_code,
      contact_number,
      address_line_1,
      address_line_2,
      state_province,
    } = address;

    const payload = {
      city: _.defaultTo(city, null),
      type: _.defaultTo(type, null),
      active: parseBoolean(active, true),
      country: _.defaultTo(country, null),
      user_id: _.defaultTo(user.uid, null),
      primary: parseBoolean(primary, null),
      user_name: _.defaultTo(user_name, null),
      postal_code: _.defaultTo(postal_code, null),
      contact_number: _.defaultTo(contact_number, null),
      address_line_1: _.defaultTo(address_line_1, null),
      address_line_2: _.defaultTo(address_line_2, null),
      state_province: _.defaultTo(state_province, null),
    };

    return payload;
  }

  getParsedUserAddressResponsePayload(address: any = {}) {
    address = JSON.parse(JSON.stringify(address));

    // delete unnecessary attributes
    delete address._id;
    delete address.$setOnInsert;
    delete address.__v;
    delete address.user_id;
    delete address.active;

    return address;
  }
}
