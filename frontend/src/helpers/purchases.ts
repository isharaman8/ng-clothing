// third party imports
import axios from 'axios';
import { goto } from '$app/navigation';

// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';
import { getBearerToken } from '../utils';
import type { ReturnData } from '../interfaces';
import { _getParsedProductsQuery } from './parser';

export const getUserPurchases = async (userDetails: any, query: any = {}) => {
	const parsedQuery = _getParsedProductsQuery(query);
	const result: any = { error: false, data: null, message: null };
	const url = `${settings.config.baseApiUrl}/${ROUTES.purchases}`;

	try {
		if (!userDetails.auth_token) {
			throw new Error('user token is required');
		}

		const tempData = await axios.get(url, {
			headers: {
				Authorization: getBearerToken(userDetails)
			},
			params: parsedQuery
		});

		if (tempData.status !== 200) {
			throw new Error(tempData.data.message);
		}

		result['data'] = tempData.data.purchases;
	} catch (error: any) {
		result['error'] = true;
		result['message'] = error?.response?.data?.message || error.message;
	}

	return result;
};

export const createOrUpdatePurchase = async (userData: any, _payload: any) => {
	const payload = { purchase: { ..._payload } };
	const url = `${settings.config.baseApiUrl}/${ROUTES.purchases}`;
	const returnData: ReturnData = { error: false, message: null, data: undefined };

	try {
		if (!userData.auth_token) {
			goto('/login');
			throw new Error('please provide auth token');
		}

		const tempData = await axios.post(url, payload, {
			headers: { Authorization: getBearerToken(userData) }
		});

		if (tempData.status !== 201) {
			throw new Error(tempData.data.message);
		}

		returnData['data'] = tempData.data;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};
