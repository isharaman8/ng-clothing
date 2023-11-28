// For Users
export const _getNameAggregationFilter = (query) => {
  const filter = [];

  if (query.name) {
    filter.push({ name: { $in: [query.name] } });
  }

  return filter;
};

export const _getEmailAggregationFilter = (query) => {
  const filter = [];

  if (query.email) {
    filter.push({ email: { $in: [query.email] } });
  }

  return filter;
};

export const _getUserNameAggregationFilter = (query) => {
  const filter = [];

  if (query.username) {
    filter.push({ username: { $in: [query.username] } });
  }

  return filter;
};
