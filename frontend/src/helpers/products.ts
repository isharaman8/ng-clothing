// third party imports
import _ from 'lodash';
import axios from 'axios';

// inner imports
import { ROUTES } from '../constants';
import { productData } from '../stores';
import settings from '../config/settings';
import { _getParsedProductsQuery } from './parser';
import { getBearerToken, parseArray } from '../utils';

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

// review api functions
const getParsedCreateOrUpdateReview = (review: any = {}, oldReview: any = {}) => {
	const { images, description, rating } = review;

	const payload = {
		images: parseArray(images, oldReview.images) || [],
		rating: _.defaultTo(rating, oldReview.rating) || 0,
		description: _.defaultTo(description, oldReview.description) || ''
	};

	return payload;
};

export const createOrUpdateReviewFeedback = async (
	userData: any,
	productUid: string,
	reviewPayload: any,
	oldReview: any = {},
	reviewUid: string | null = null
) => {
	const payload = { review: getParsedCreateOrUpdateReview(reviewPayload, oldReview) };
	const returnData: any = { error: false, message: null, data: undefined };
	const headers = { headers: { Authorization: getBearerToken(userData) } };
	const url = `${settings.config.baseApiUrl}/${ROUTES.products}/${productUid}/review/${reviewUid || ''}`;

	if (!userData.auth_token) {
		throw new Error('please provide auth token');
	}

	try {
		let tempData: any = {};

		if (_.isEmpty(reviewUid)) {
			tempData = await axios.post(url, payload, headers);
		} else {
			tempData = await axios.patch(url, payload, headers);
		}

		if ([200, 201].includes(tempData.status) === false) {
			throw new Error(tempData.data.message);
		}

		returnData['data'] = tempData.data.review;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};

export const getProductReviews = async (queryParams: any = {}, productUid: string | null = null) => {
	const query = _getParsedProductsQuery(queryParams);
	const returnData: any = { error: false, message: null, data: undefined };

	let url = `${settings.config.baseApiUrl}/${ROUTES.products}`;

	if (productUid) {
		url += `/${productUid}/review`;
	} else {
		url += '/review/all';
	}

	try {
		const tempData = await axios.get(url, { params: query });

		if (tempData.status !== 200) {
			throw new Error(tempData.data.message);
		}

		returnData['data'] = tempData.data.reviews;
	} catch (error: any) {
		returnData['error'] = true;
		returnData['message'] = error?.response?.data?.message || error.message;
	}

	return returnData;
};
