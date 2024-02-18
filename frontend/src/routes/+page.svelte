<script>
	// third party imports
	import * as store from 'svelte/store';

	// inner imports
	import { authUserData } from '../stores';
	import { getProfile } from '../helpers/auth';
	import { getProducts } from '../helpers/products';
	import { _getParsedProductsQuery } from '../helpers/parser';
	import ListProducts from '../components/ListProducts/ListProducts.svelte';

	// variables
	const params = _getParsedProductsQuery({});
	const userData = store.get(authUserData);

	// init invokes
	getProducts(params);
	getProfile(userData);
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="mt-24 w-[100vw] min-h-[88vh]">
	<ListProducts title="Trending" />
</section>
