import { error } from '@sveltejs/kit';
import settings from '../../config/settings';
import * as store from 'svelte/store';
import { authUserData } from '../../stores';
import { getBearerToken } from '../../utils';
import _ from 'lodash';

export const load = async ({ fetch }) => {
	try {
		const userDetails = store.get(authUserData);

		if (_.isEmpty(userDetails)) {
			return {};
		}

		const url = `${settings.config.baseApiUrl}/cart`;
		const response = await fetch(url, {
			headers: {
				Authorization: getBearerToken(userDetails)
			}
		});

		if (response.status !== 200) {
			throw error(404, {
				message: 'No item in the cart!'
			});
		}

		const { cart } = await response.json();

		return {
			cart
		};
	} catch (err) {
		console.error('Error loading cart:', err);
		throw error(500, { message: 'Internal Server Error' });
	}
};
