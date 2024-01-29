// third party imports
import * as _ from 'lodash';

// inner imports
import { Params, QueryParams } from 'src/interfaces';
import { parseBoolean, parseNumber } from 'src/utils';

export const _getParsedParams = (params: Params = {}) => {
  return {
    userId: params.user_id,
    productId: params.product_uid,
    purchaseId: params.purchase_uid,
    cartId: params.cart_uid,
    categoryId: params.category_uid,
    reviewId: params.review_uid,
  };
};

export const _getParsedQuery = (query: QueryParams = {}) => {
  const queryPayload = {
    uid: _.defaultTo(query.uid, null),
    name: _.defaultTo(query.name, null),
    price: parseNumber(query.price, null),
    gender: _.defaultTo(query.gender, null),
    active: parseBoolean(query.active, true),
    userId: _.defaultTo(query.user_id, null),
    minPrice: parseNumber(query.min_price, 0),
    pageSize: parseNumber(query.page_size, 10),
    reviews: parseBoolean(query.reviews, false),
    verified: parseBoolean(query.verified, null),
    pageNumber: parseNumber(query.page_number, 1),
    productId: _.defaultTo(query.product_uid, null),
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

  return queryPayload;
};
