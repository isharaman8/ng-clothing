// inner imports
import { parseArray } from 'src/utils';

export const _getNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.name?.length) {
    filter.push({ name: { $in: parseArray(query.name, [query.name]) } });
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
