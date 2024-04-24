// third party imports
import * as _ from 'lodash';

// inner imports
import { Params, QueryParams } from 'src/interfaces';
import { _isValidQueryParam, parseBoolean, parseNumber } from 'src/utils';

export const _getParsedParams = (params: Params = {}) => {
  return {
    userId: params.user_id,
    cartId: params.cart_uid,
    reviewId: params.review_uid,
    productId: params.product_uid,
    categoryId: params.category_uid,
    purchaseId: params.purchase_uid,
    userAddressId: params.user_address_uid,
  };
};

export const _getParsedQuery = (query: QueryParams = {}) => {
  const queryPayload = {
    q: _.defaultTo(query.q, null),
    uid: _.defaultTo(query.uid, null),
    name: _.defaultTo(query.name, null),
    slug: _.defaultTo(query.slug, null),
    price: parseNumber(query.price, null),
    token: _.defaultTo(query.token, null),
    email: _.defaultTo(query.email, null),
    gender: _.defaultTo(query.gender, null),
    active: parseBoolean(query.active, true),
    userId: _.defaultTo(query.user_id, null),
    minPrice: parseNumber(query.min_price, 0),
    pageSize: parseNumber(query.page_size, 10),
    reviews: parseBoolean(query.reviews, false),
    username: _.defaultTo(query.username, null),
    verified: parseBoolean(query.verified, null),
    pageNumber: parseNumber(query.page_number, 1),
    orderType: _.defaultTo(query.order_type, null),
    addresses: parseBoolean(query.addresses, false),
    productId: _.defaultTo(query.product_uid, null),
    uploadType: _.defaultTo(query.upload_type, null),
    purchaseId: _.defaultTo(query.purchase_uid, null),
    requiredSize: _.defaultTo(query.required_size, null),
    maxPrice: parseNumber(query.max_price, Number.MAX_SAFE_INTEGER),
  };

  if (queryPayload.minPrice > queryPayload.maxPrice) {
    queryPayload.minPrice = 0;
    queryPayload.maxPrice = Number.MAX_SAFE_INTEGER;
  }

  const skipDocs = (queryPayload.pageNumber - 1) * queryPayload.pageSize;

  queryPayload['pageSkip'] = skipDocs;

  // trim strings
  _.forEach(queryPayload, (value, key) => {
    if (_.isString(value)) {
      value = _.trim(value);

      if (_.isEmpty(value)) {
        value = null;
      }

      if (_isValidQueryParam(value)) {
        value = null;
      }

      queryPayload[key] = value;
    }
  });

  return queryPayload;
};
