// third party imports
import * as _ from 'lodash';

// inner imports
import { parseArray } from 'src/utils';

export const _getNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.name?.length) {
    const reqdNameArray = _.map(parseArray(query.name, [query.name]), (name) => new RegExp('^' + name, 'i'));

    filter.push({ name: { $in: reqdNameArray } });
  }

  return filter;
};

export const _getEmailAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.email?.length) {
    filter.push({ email: { $in: parseArray(query.email, [query.email]) } });
  }

  return filter;
};

export const _getUserNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.username?.length) {
    filter.push({ username: { $in: parseArray(query.username, [query.username]) } });
  }

  return filter;
};

export const _getUidAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.uid?.length) {
    filter.push({ uid: { $in: parseArray(query.uid, [query.uid]) } });
  }

  if (query.userId) {
    filter.push({ user_id: { $in: parseArray(query.userId, [query.userId]) } });
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

  if (query.productId) {
    filter.push({ 'products.uid': { $in: parseArray(query.productId, [query.productId]) } });
  }

  return filter;
};

export const _getProductReviewFilter = (query: any = {}) => {
  const filter = [];

  if (query.productId) {
    let reqdProductUidArray: any;

    if (_.isArray(query.productId)) {
      reqdProductUidArray = query.productId;
    } else {
      reqdProductUidArray = _.split(query.productId, ',');
    }

    filter.push({ product_id: { $in: reqdProductUidArray } });
  }

  return filter;
};

export const _getAvailableSizesAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.requiredSize) {
    let reqdSizeArray: any;

    if (_.isArray(query.requiredSize)) {
      reqdSizeArray = query.requiredSize;
    } else {
      reqdSizeArray = _.split(query.requiredSize, ',');
    }

    for (const size of reqdSizeArray) {
      filter.push({ [`available_sizes.${size}`]: { $gte: 1 } });
    }
  }

  return filter;
};

export const _getGenderAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.gender) {
    let reqdGenderArray: any;

    if (_.isArray(query.gender)) {
      reqdGenderArray = query.gender;
    } else {
      reqdGenderArray = _.split(query.gender, ',');
    }

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

  if (query.slug) {
    const reqdSlugArray = parseArray(query.slug, [query.slug]);

    filter.push({ slug: { $in: reqdSlugArray } });
  }

  return filter;
};
