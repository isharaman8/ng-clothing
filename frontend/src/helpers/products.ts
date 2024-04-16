// third party imports
import axios from 'axios';
import { goto } from '$app/navigation';

// inner imports
import { ROUTES } from '../constants';
import { productData } from '../stores';
import { getBearerToken } from '../utils';
import settings from '../config/settings';
import type { ReturnData } from '../interfaces';
import { _getParsedProductsQuery } from './parser';

// functions
export const getProducts = async (queryParams: any = {}) => {
	const query = _getParsedProductsQuery(queryParams);

	let products = [];

	try {
		const _products = await axios.get(`${settings.config.baseApiUrl}/${ROUTES.products}`, {
			params: query
		});

		products.push(..._products.data['products']);

		productData.set(products);
	} catch (error: any) {
		return { error: true, message: error.message, products: [] };
	}

	return { products, error: false };
};
