// third party imports
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';
import { getBearerToken } from '../utils';
import type { ReturnData } from '../interfaces';

export const handleImageUpload = async (imageFile: File, authToken: string): Promise<ReturnData> => {
	const formData = new FormData();
	const result: any = { error: false, message: undefined, data: null };
	const url = `${settings.config.baseApiUrl}/${ROUTES.uploads}/image-upload`;

	formData.append('images', imageFile);

	try {
		if (!imageFile || !authToken) {
			throw new Error('file and token are required');
		}

		const response = await axios.post(url, formData, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				'Content-Type': 'multipart/form-data'
			}
		});

		if (response.status !== 200) {
			throw new Error(response.data.message);
		}

		result['data'] = response.data;
	} catch (error: any) {
		result['error'] = true;
		result['message'] = error?.response?.data?.message || error.message;
	}

	return result;
};

export const getUserUploads = async (userDetails: any = {}) => {
	const result: any = { error: false, message: undefined, data: null };
	const url = `${settings.config.baseApiUrl}/${ROUTES.uploads}/image`;

	try {
		if (!userDetails?.auth_token) {
			throw new Error('user token is required');
		}

		const tempData = await axios.get(url, {
			headers: {
				Authorization: getBearerToken(userDetails)
			}
		});

		if (tempData.status !== 200) {
			throw new Error(tempData.data.message);
		}

		result['data'] = tempData.data.images;
	} catch (error: any) {
		result['error'] = true;
		result['message'] = error?.response?.data?.message || error.message;
	}

	return result;
};
