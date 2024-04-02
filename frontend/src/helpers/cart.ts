// third party imports
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';
import { getBearerToken } from '../utils';
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
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};
