// third party imports
import axios from 'axios';

// inner imports
import { ROUTES } from '../../constants';
import settings from '../../config/settings';
import { parseBoolean, parseNumber, parseString } from '../../utils';

export const sampleTitle = 'Page Title';

// functions
export const getProducts = async (queryParams: any = {}) => {
	const { active, name, uid, price } = queryParams;
	const params = {
		uid: parseString(uid, null),
		name: parseString(name, null),
		price: parseNumber(price, null),
		active: parseBoolean(active, true)
	};

	let products = [];

	try {
		const _products = await axios.get(`${settings.config.baseApiUrl}/${ROUTES.products}`, {
			params
		});

		products.push(..._products.data['products']);
	} catch (error: any) {
		return { error: true, message: error.message, products: [] };
	}

	return { products, error: false };
};
