export const _getNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.name) {
    filter.push({ name: { $in: [query.name] } });
  }

  return filter;
};

export const _getEmailAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.email) {
    filter.push({ email: { $in: [query.email] } });
  }

  return filter;
};

export const _getUserNameAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.username) {
    filter.push({ username: { $in: [query.username] } });
  }

  return filter;
};

export const _getUidAggregationFilter = (query: any = {}) => {
  const filter = [];

  if (query.uid) {
    filter.push({ uid: { $in: [query.uid] } });
  }

  if (query.userId) {
    filter.push({ user_id: query.userId });
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
    filter.push({ price: { $in: [query.price] } });
  } else {
    filter.push(priceFilter);
  }

  return filter;
};
