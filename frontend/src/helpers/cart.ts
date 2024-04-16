// third party imports
import axios from 'axios';
import { goto } from '$app/navigation';

// inner imports
import { cartData } from '../stores';
import { ROUTES } from '../constants';
import settings from '../config/settings';
import { getBearerToken } from '../utils';
import type { ReturnData } from '../interfaces';
import { _getParsedProductsQuery } from './parser';

export const getUserCart = async (userData: any = {}) => {
	const returnData: any = { error: false, message: null, data: undefined };

	try {
		if (!userData.auth_token) {
			throw new Error('please provide auth token');
		}

		const userCart = await axios.get(`${settings.config.baseApiUrl}/${ROUTES.cart}`, {
			headers: {
				Authorization: getBearerToken(userData)
			}
		});

		if (userCart.status !== 200) {
			throw new Error(userCart.data.message);
		}

		returnData['data'] = userCart.data.cart;

		// set cart to store
		cartData.set(returnData.data);
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};

export const createOrUpdateCart = async (userData: any, updatePayload: any): Promise<ReturnData> => {
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

		returnData['data'] = tempData.data.cart;

		// set to cart
		cartData.set(returnData.data);
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};
