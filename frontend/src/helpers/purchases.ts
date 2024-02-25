// third party imports
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';
import { getBearerToken } from '../utils';
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
