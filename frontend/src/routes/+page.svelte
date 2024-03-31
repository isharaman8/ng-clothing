<script lang="ts">
	// third party imports
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';

	// inner imports
	import { authUserData } from '../stores';
	import { getProfile } from '../helpers/auth';
	import { getProducts } from '../helpers/products';
	import { _getParsedProductsQuery } from '../helpers/parser';
	import { showToast } from '../components/misc/Toasts/toasts';
	import ListProducts from '../components/ListProducts/ListProducts.svelte';

	// functions
	async function localGetProfile() {
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

	// variables
	const params = _getParsedProductsQuery({});
	const userData = store.get(authUserData);

	// init invokes
	onMount(() => {
		getProducts(params);
		localGetProfile();
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="mt-24 w-[100vw] min-h-[88vh]">
	<ListProducts title="Trending" />
</section>
