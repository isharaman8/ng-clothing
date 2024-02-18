import _ from 'lodash';
import { parseBoolean, parseNumber } from '../utils';

export const _getParsedProductsQuery = (query: any = {}) => {
	return {
		name: _.defaultTo(query.name, null),
		uid: _.defaultTo(query.uid, null),
		slug: _.defaultTo(query.slug, null),
		price: parseNumber(query.price, null),
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
		productId: _.defaultTo(query.product_uid, null),
		purchaseId: _.defaultTo(query.purchase_uid, null),
		requiredSize: _.defaultTo(query.required_size, null),
		maxPrice: parseNumber(query.max_price, Number.MAX_SAFE_INTEGER)
	};
};
