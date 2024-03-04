import { error } from '@sveltejs/kit';
import settings from '../../../config/settings';

export const load = async ({ params, fetch }) => {
	try {
		const { productId } = params;
		const url = `${settings.config.baseApiUrl}/product/${productId}?&reviews=true`;
		const response = await fetch(url);

		if (!response.body) {
			throw error(404, {
				message: 'Product not found!'
			});
		}
		const { products } = await response.json();

		return {
			product: products[0]
		};
	} catch (err) {
		console.error('Error loading product:', err);
		throw error(500, { message: 'Internal Server Error' });
	}
};
