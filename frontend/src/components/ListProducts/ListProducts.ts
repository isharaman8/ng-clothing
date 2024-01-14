// third party imports
import axios from 'axios';

// inner imports
import { ROUTES } from '../../constants';
import settings from '../../config/settings';
import { parseBoolean, parseNumber, parseString } from '../../utils';

export const sampleProducts = [
	{
		uid: 't8jRwEcKAT_oj7VjqRojU',
		active: true,
		created_at: '2023-12-11T19:41:56.001Z',
		images: [
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/wallpaperflare.com_wallpaper.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=ac3479c5d0fb7025235990a2e011b9dcacac89b632ebee6805eb6512922732ee&X-Amz-SignedHeaders=host&x-id=GetObject'
		],
		name: 'Product',
		price: 20,
		updated_at: '2023-12-11T19:41:56.001Z',
		user_id: 'JVcFPPNDtXkDPYX4WkjfT'
	},
	{
		uid: 'U5ku3bZS6vtbnTgCF898c',
		active: true,
		created_at: '2023-12-11T20:09:03.485Z',
		images: [
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/Screenshot-2023-11-14_18%3A42%3A59.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=fc2c8c5ea465fb280a7d026f6fb5db0fd3aae4758654f571ac63c13f2394681e&X-Amz-SignedHeaders=host&x-id=GetObject',
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/Screenshot-2023-11-14_18%3A44%3A31.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=b913e25b788d2578c9dabcec081477503a8f3a3008e55c9d410424a473cec669&X-Amz-SignedHeaders=host&x-id=GetObject',
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/wallpaperflare.com_wallpaper.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=ac3479c5d0fb7025235990a2e011b9dcacac89b632ebee6805eb6512922732ee&X-Amz-SignedHeaders=host&x-id=GetObject'
		],
		name: 'Product',
		price: 20,
		updated_at: '2023-12-11T20:09:03.485Z',
		user_id: 'JVcFPPNDtXkDPYX4WkjfT'
	},
	{
		uid: '0DxpYBZNUETJZ4kYB2kJT',
		active: true,
		created_at: '2023-12-26T18:44:27.135Z',
		images: [
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/Screenshot-2023-11-14_18%3A42%3A59.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=fc2c8c5ea465fb280a7d026f6fb5db0fd3aae4758654f571ac63c13f2394681e&X-Amz-SignedHeaders=host&x-id=GetObject',
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/Screenshot-2023-11-14_18%3A44%3A31.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=b913e25b788d2578c9dabcec081477503a8f3a3008e55c9d410424a473cec669&X-Amz-SignedHeaders=host&x-id=GetObject',
			'https://clothingdevbucket.s3.us-east-1.amazonaws.com/wallpaperflare.com_wallpaper.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASNVAI64GI2PZALOH%2F20240109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240109T183738Z&X-Amz-Expires=604800&X-Amz-Signature=ac3479c5d0fb7025235990a2e011b9dcacac89b632ebee6805eb6512922732ee&X-Amz-SignedHeaders=host&x-id=GetObject'
		],
		name: 'Product',
		price: 20,
		updated_at: '2023-12-26T18:44:27.135Z',
		user_id: 'JVcFPPNDtXkDPYX4WkjfT'
	}
];
export const sampleTitle = 'Page Title';

// functions
export const getProducts = async (queryParams: any = {}) => {
	const { active, name, uid, price } = queryParams;
	const params = {
		uid: parseString(uid, null),
		name: parseString(name, null),
		price: parseNumber(price, null),
		active: parseBoolean(active, true)
	};

	let products = [];

	try {
		const _products = await axios.get(`${settings.config.baseApiUrl}/${ROUTES.products}`, {
			params
		});

		products.push(..._products.data['products']);
	} catch (error: any) {
		return { error: true, message: error.message, products: [] };
	}

	return { products, error: false };
};
