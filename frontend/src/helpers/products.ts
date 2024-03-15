// third party imports
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import { productData } from '../stores';
import settings from '../config/settings';
import { _getParsedProductsQuery } from './parser';
import type { ReturnData } from '../interfaces';
import { getBearerToken } from '../utils';
import { goto } from '$app/navigation';

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

export const addToCart = async (userData: any, updatePayload: any): Promise<ReturnData> => {
	const returnData: ReturnData = { error: false, message: null, data: undefined };
	const url = `${settings.config.baseApiUrl}/${ROUTES.cart}/create-or-update`;
	const payload = {
		cart: { ...updatePayload }
	};

	try {
		if (!userData.auth_token) {
			goto('/login');
			throw new Error('please provide auth token');
		}

		const tempData = await axios.post(url, payload, {
			headers: { Authorization: getBearerToken(userData) }
		});

		if (tempData.status !== 200) {
			throw new Error(tempData.data.message);
		}

		returnData['data'] = tempData.data;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};
