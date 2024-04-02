<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';

	// inner imports
	import { getProfile } from '../helpers/auth';
	import { getProducts } from '../helpers/products';
	import { authUserData, productData } from '../stores';
	import { _getParsedProductsQuery } from '../helpers/parser';
	import { showToast } from '../components/misc/Toasts/toasts';
	import ListProducts from '../components/ListProducts/ListProducts.svelte';

	// functions
	async function localGetProfile() {
		if (_.isEmpty(userData)) return;

		try {
			const loggedInUserData = await getProfile(userData);

			if (loggedInUserData.error) {
				throw new Error(loggedInUserData.message);
			}
		} catch (error: any) {
			authUserData.set({});
			showToast(error.message, error.message, 'error');
		}
	}

	async function localGetProducts() {
		productsLoading = true;

		try {
			await getProducts(params);
		} catch (error: any) {
			productData.set({});
			showToast(error.message, error.message, 'error');
		} finally {
			productsLoading = false;
		}
	}

	// variables
	let productsLoading = false;

	const params = _getParsedProductsQuery({});
	const userData = store.get(authUserData);

	// init invokes
	onMount(() => {
		localGetProducts();
		localGetProfile();
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="mt-24 w-[100vw] min-h-[88vh]">
	<ListProducts title="Trending" loading={productsLoading} />
</section>
