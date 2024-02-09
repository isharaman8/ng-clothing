// third party imports
import _ from 'lodash';

// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';
import type { ReturnData, SignupData } from '../interfaces';
import { parseBoolean, parseString, validateEmail } from '../utils';

// third party imports
import axios from 'axios';

// inner helpers
const getParsedSignupPayload = (obj: any): SignupData => {
	return {
		name: parseString(obj.name, null),
		email: parseString(obj.email, null),
		active: parseBoolean(obj.active, true),
		password: parseString(obj.password, null),
		username: parseString(obj.username, null),
		profile_picture: parseString(obj.profile_picture, null)
	};
};

// exported functions
export const login = async (email: string, password: string): Promise<ReturnData> => {
	const returnData: any = { error: false, data: null, message: undefined };

	try {
		if (!email || !password) {
			throw new Error('email or password missing');
		}

		if (!validateEmail(email)) {
			throw new Error('Please write valid email');
		}

		const payload = { user: { email, password } };
		const url = `${settings.config.baseApiUrl}/${ROUTES.auth}/login`;
		const tempData = await axios.post(url, payload);

		if (tempData.status !== 200) {
			const errorMessage = tempData.data?.message || 'Something went wrong';

			throw new Error(errorMessage);
		}

		returnData['data'] = tempData.data;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};

export const signup = async (userData: SignupData): Promise<ReturnData> => {
	const { email, password, username, name } = userData;
	const returnData: any = { error: false, data: null, message: undefined };

	const parsedSignupPayload = getParsedSignupPayload(userData);

	try {
		if (!email || !password || !username || !name) {
			throw new Error('please provide required data');
		}

		if (!validateEmail(email)) {
			throw new Error('Please write valid email');
		}

		const tempData = await axios.post(`${settings.config.baseApiUrl}/${ROUTES.auth}/signup`, {
			user: parsedSignupPayload
		});

		if (tempData.status !== 200) {
			const errorMessage = tempData.data?.message || 'Something went wrong';

			throw new Error(errorMessage);
		}

		returnData['data'] = tempData.data;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};

export const updateProfile = async (userData: any, updatePayload: any): Promise<ReturnData> => {
	const returnData: any = { error: false, message: null, data: undefined };
	const url = `${settings.config.baseApiUrl}/${ROUTES.user}/${userData.user.uid}`;
	const payload = {
		user: {
			name: _.defaultTo(updatePayload.name, null),
			profile_picture: _.defaultTo(updatePayload.profile_picture, null)
		}
	};

	try {
		if (!userData.auth_token) {
			throw new Error('please provide auth token');
		}

		const tempData = await axios.patch(url, payload, {
			headers: { Authorization: `Bearer ${userData.auth_token}` }
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
