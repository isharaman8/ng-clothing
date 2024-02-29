import _ from 'lodash';
import { parseBoolean, parseNumber } from '../utils';

export const _getParsedProductsQuery = (query: any = {}) => {
	return {
		q: _.defaultTo(query.q, null),
		uid: _.defaultTo(query.uid, null),
		name: _.defaultTo(query.name, null),
		slug: _.defaultTo(query.slug, null),
		price: parseNumber(query.price, null),
		email: _.defaultTo(query.email, null),
		gender: _.defaultTo(query.gender, null),
		active: parseBoolean(query.active, true),
		user_id: _.defaultTo(query.user_id, null),
		min_price: parseNumber(query.min_price, 0),
		page_size: parseNumber(query.page_size, 10),
		reviews: parseBoolean(query.reviews, false),
		username: _.defaultTo(query.username, null),
		verified: parseBoolean(query.verified, null),
		page_number: parseNumber(query.page_number, 1),
		order_type: _.defaultTo(query.order_type, null),
		product_uid: _.defaultTo(query.product_uid, null),
		purchase_uid: _.defaultTo(query.purchase_uid, null),
		required_size: _.defaultTo(query.required_size, null),
		max_price: parseNumber(query.max_price, Number.MAX_SAFE_INTEGER)
	};
};
