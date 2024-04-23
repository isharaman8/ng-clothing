// third party imports
import _ from 'lodash';
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import settings from '../config/settings';
import type { ReturnData } from '../interfaces';
import { _getParsedProductsQuery } from './parser';
import { getBearerToken, parseArray } from '../utils';

export const handleImageUpload = async (imageFiles: Array<File>, authToken: string): Promise<ReturnData> => {
	const formData = new FormData();
	const result: any = { error: false, message: undefined, data: null };
	const url = `${settings.config.baseApiUrl}/${ROUTES.uploads}/image-upload`;

	imageFiles = parseArray(imageFiles, [imageFiles]);

	for (const imageFile of imageFiles) {
		formData.append('images', imageFile);
	}

	try {
		if (!imageFiles || _.isEmpty(imageFiles) || !authToken) {
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

		result['data'] = response.data.images;
	} catch (error: any) {
		result['error'] = true;
		result['message'] = error?.response?.data?.message || error.message;
	}

	return result;
};

export const getUserUploads = async (userDetails: any = {}, uploadType: string | null = null) => {
	const result: any = { error: false, message: undefined, data: null };
	const url = `${settings.config.baseApiUrl}/${ROUTES.uploads}/uploads`;
	const query = { upload_type: uploadType };

	try {
		if (!userDetails?.auth_token) {
			throw new Error('user token is required');
		}

		const tempData = await axios.get(url, {
			headers: {
				Authorization: getBearerToken(userDetails)
			},
			params: query
		});

		if (tempData.status !== 200) {
			throw new Error(tempData.data.message);
		}

		result['data'] = tempData.data.uploads;
	} catch (error: any) {
		result['error'] = true;
		result['message'] = error?.response?.data?.message || error.message;
	}

	return result;
};
