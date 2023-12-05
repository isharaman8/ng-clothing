// third party imports
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';

// inner imports
import { Params, QueryParams } from 'src/interfaces';
import { parseArray, parseBoolean, parseNumber } from 'src/utils';
import { CreateOrUpdateProductDto, CreateOrUpdatePurchaseDto, CreateOrUpdateUserDto } from 'src/dto';

export const _getParsedUserBody = (body: CreateOrUpdateUserDto): CreateOrUpdateUserDto => {
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
};

export const _getParsedProductBody = (body: CreateOrUpdateProductDto, user: any = {}): CreateOrUpdateProductDto => {
  const { active, images, name, price, uid } = body;

  const payload: any = {
    uid: _.defaultTo(uid, null),
    name: _.defaultTo(name, null),
    price: parseNumber(price, null),
    images: parseArray(images, null),
    active: parseBoolean(active, true),
    user_id: _.defaultTo(user.uid, null),
  };

  return payload;
};

export const _getParsedPurchaseBody = (body: any, user: any = {}): CreateOrUpdatePurchaseDto => {
  const { uid, products, verified } = body;

  const payload: any = {
    uid: _.defaultTo(uid, null),
    products: parseArray(products, []),
    user_id: _.defaultTo(user.uid, null),
    verified: parseBoolean(verified, false),
  };

  return payload;
};

export const _getParsedParams = (params: Params = {}) => {
  return {
    userId: params.user_id,
    productId: params.product_uid,
    purchaseId: params.purchase_uid,
  };
};

export const _getParsedQuery = (query: QueryParams = {}) => {
  const queryPayload = {
    uid: _.defaultTo(query.uid, null),
    name: _.defaultTo(query.name, null),
    price: parseNumber(query.price, null),
    active: parseBoolean(query.active, true),
    userId: _.defaultTo(query.user_id, null),
    minPrice: parseNumber(query.min_price, 0),
    verified: parseBoolean(query.verified, null),
    maxPrice: parseNumber(query.max_price, Number.MAX_SAFE_INTEGER),
  };

  if (queryPayload.minPrice > queryPayload.maxPrice) {
    queryPayload.minPrice = 0;
    queryPayload.maxPrice = Number.MAX_SAFE_INTEGER;
  }

  return queryPayload;
};

export const _getParsedUserResponsePayload = (user: any = {}) => {
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
};

export const _getParsedProductResponsePayload = (product: any = {}) => {
  product = JSON.parse(JSON.stringify(product));

  // delete unnecessary properties
  delete product.$setOnInsert;
  delete product._id;
  delete product.__v;

  return product;
};

export const _getParsedPurchaseResponsePayload = (purchase: any = {}) => {
  purchase = JSON.parse(JSON.stringify(purchase));

  // delete unnecessary properties
  delete purchase.$setOnInsert;
  delete purchase._id;
  delete purchase.__v;

  return purchase;
};
