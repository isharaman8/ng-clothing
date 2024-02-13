// third party imports
import * as _ from 'lodash';

// inner imports
import { _arrayOrSplit, parseArray } from 'src/utils';

export const _getNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.name)) {
    let reqdNameArray = _arrayOrSplit(query.name, ',');

    reqdNameArray = _.map(reqdNameArray, (name) => new RegExp('^' + name, 'i'));

    filter.push({ name: { $in: reqdNameArray } });
  }

  return filter;
};

export const _getEmailAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.email)) {
    let reqdEmailArray = _arrayOrSplit(query.email, ',');

    filter.push({ email: { $in: reqdEmailArray } });
  }

  return filter;
};

export const _getUserNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.username)) {
    let reqdUsernameArray = _arrayOrSplit(query.username, ',');

    filter.push({ username: { $in: reqdUsernameArray } });
  }

  return filter;
};

export const _getUidAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.uid)) {
    let reqdUidArray = _arrayOrSplit(query.uid, ',');

    filter.push({ uid: { $in: reqdUidArray } });
  }

  if (!_.isEmpty(query.userId)) {
    let reqdUserUidArray = _arrayOrSplit(query.userId, ',');

    filter.push({ user_id: { $in: reqdUserUidArray } });
  }

  return filter;
};

export const _getActiveAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.active !== null) {
    filter.push({ active: Boolean(query.active) });
  }

  return filter;
};

export const _getPriceAggregationFilter = (query: any = {}) => {
  const filter = [];
  const priceFilter: any = { price: { $lte: query.maxPrice, $gte: query.minPrice } };

  if (query.price && !isNaN(query.price)) {
    filter.push({ price: query.price });
  } else {
    filter.push(priceFilter);
  }

  return filter;
};

export const _getVerifiedAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.verified !== null) {
    filter.push({ verified: Boolean(query.verified) });
  }

  return filter;
};

export const _getProductPurchaseFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.productId)) {
    let reqdPurchasedProductsArray = _arrayOrSplit(query.productId, ',');

    filter.push({ 'products.uid': { $in: reqdPurchasedProductsArray } });
  }

  return filter;
};

export const _getProductReviewFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.productId)) {
    let reqdProductUidArray = _arrayOrSplit(query.productId, ',');

    filter.push({ product_id: { $in: reqdProductUidArray } });
  }

  return filter;
};

export const _getAvailableSizesAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.requiredSize)) {
    let reqdSizeArray = _arrayOrSplit(query.requiredSize, ',');

    for (const size of reqdSizeArray) {
      filter.push({ [`available_sizes.${size}`]: { $gte: 1 } });
    }
  }

  return filter;
};

export const _getGenderAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.gender)) {
    let reqdGenderArray = _arrayOrSplit(query.gender, ',');

    for (const gender of reqdGenderArray) {
      filter.push({
        gender: { $elemMatch: { $eq: gender } },
      });
    }
  }

  return filter;
};

export const _getSlugAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.slug)) {
    let reqdSlugArray = _arrayOrSplit(query.slug, ',');

    filter.push({ slug: { $in: reqdSlugArray } });
  }

  return filter;
};

export const _getMimeTypeAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (!_.isEmpty(query.mimeType)) {
    let reqdMimeTypeArray = _arrayOrSplit(query.mimeType, ',');

    filter.push({ mimetype: { $in: reqdMimeTypeArray } });
  }

  return filter;
};
