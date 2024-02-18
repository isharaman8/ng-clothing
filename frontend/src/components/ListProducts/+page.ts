// third party imports
import { getProducts } from '../../helpers/products';
import { _getParsedProductsQuery } from '../../helpers/parser';

export async function load() {
	const params = _getParsedProductsQuery({});

	await getProducts(params);
}
