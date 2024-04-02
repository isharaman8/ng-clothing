// third party imports
import _ from 'lodash';
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import { getBearerToken, parseBoolean } from '../utils';
import settings from '../config/settings';

// inner helpers
const getParsedCreateOrUpdateUserAddress = (address: any = {}, oldAddress: any = {}) => {
	const {
		city,
		type,
		country,
		primary,
		user_name,
		postal_code,
		state_province,
		contact_number,
		address_line_1,
		address_line_2
	} = address;

	const payload = {
		city: _.defaultTo(city, oldAddress.city) || null,
		type: _.defaultTo(type, oldAddress.type) || null,
		country: _.defaultTo(country, oldAddress.country) || null,
		primary: parseBoolean(primary, oldAddress.primary) || false,
		user_name: _.defaultTo(user_name, oldAddress.user_name) || null,
		postal_code: _.defaultTo(postal_code, oldAddress.postal_code) || null,
		state_province: _.defaultTo(state_province, oldAddress.state_province) || null,
		contact_number: _.defaultTo(contact_number, oldAddress.contact_number) || null,
		address_line_1: _.defaultTo(address_line_1, oldAddress.address_line_1) || null,
		address_line_2: _.defaultTo(address_line_2, oldAddress.address_line_2) || null
	};

	return payload;
};

// addresses helpers
export const getUserAddresses = async (userData: any = {}) => {
	const url = `${settings.config.baseApiUrl}/${ROUTES.user}/address`;
	const returnData: any = { error: false, message: null, data: undefined };

	try {
		if (!userData.auth_token) {
			throw new Error('please provide auth token');
		}

		const tempData = await axios.get(url, {
			headers: {
				Authorization: getBearerToken(userData)
			}
		});

		if (tempData.status !== 200) {
			throw new Error(tempData.data.message);
		}

		returnData['data'] = tempData.data.addresses;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};

export const addOrUpdateUserAddress = async (
	userData: any = {},
	addressPayload: any = {},
	oldAddress: any = {},
	addressUid: string | null = null
) => {
	const url = `${settings.config.baseApiUrl}/${ROUTES.user}/address/${addressUid || ''}`;
	const returnData: any = { error: false, message: null, data: undefined };
	const headers = { headers: { Authorization: getBearerToken(userData) } };
	const payload = { address: getParsedCreateOrUpdateUserAddress(addressPayload, oldAddress) };

	try {
		if (!userData.auth_token) {
			throw new Error('please provide auth token');
		}

		let tempData: any = {};

		if (_.isEmpty(addressUid)) {
			tempData = await axios.post(url, payload, headers);
		} else {
			tempData = await axios.patch(url, payload, headers);
		}

		if ([200, 201].includes(tempData.status) === false) {
			throw new Error(tempData.data.message);
		}

		returnData['data'] = tempData.data.address;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};

export const deleteUserAddress = async (userData: any = {}, userAddressUid: string | null = null) => {
	const url = `${settings.config.baseApiUrl}/${ROUTES.user}/address/${userAddressUid || ''}`;
	const returnData: any = { error: false, message: null };

	try {
		if (!userData.auth_token) {
			throw new Error('please provide auth token');
		}

		const tempData = await axios.delete(url, { headers: { Authorization: getBearerToken(userData) } });

		if (tempData.status !== 204) {
			throw new Error(tempData.data?.message || 'something went wrong');
		}
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};
