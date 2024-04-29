<script lang="ts">
	// third party imports
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import { createOrUpdateCart } from '../../helpers/cart';
	import Loader from '../../components/misc/Loader.svelte';
	import { authUserData, purchaseData } from '../../stores';
	import { showToast } from '../../components/misc/Toasts/toasts';
	import { createOrUpdatePurchase } from '../../helpers/purchases';
	import UserAddresses from '../../components/ProfileSections/UserAddresses/UserAddresses.svelte';

	// functions
	async function localAddPurchase() {
		const payload = { products, address_id: currentlySelectedAddress };

		checkOutLoading = true;

		try {
			const returnData = await createOrUpdatePurchase(userDetails, payload);

			if (returnData.error) {
				throw new Error(returnData.message || 'Error while removing item from cart');
			}

			// empty cart
			await createOrUpdateCart(userDetails, { products: [] });

			// empty purchase data
			purchaseDetails['checkout_purchase'] = {};
			purchaseData.set(purchaseDetails);

			showToast('purchase created successfully', 'purchase created successfully', 'success');
			goto('/');
		} catch (error: any) {
			showToast('unable to create purchase', error.message, 'error');
		} finally {
			checkOutLoading = false;
		}
	}

	function handleAddressSelect(addressObj: any) {
		currentlySelectedAddress = addressObj.uid;
	}

	// variable
	let checkOutLoading = false;
	let currentlySelectedAddress: any = null;
	let userDetails: any = store.get(authUserData);
	let purchaseDetails: any = store.get(purchaseData);
	let { checkout_purchase: { products = [] } = { products: [] } } = purchaseDetails;
</script>

<div class="mt-24 p-8 flex flex-col justify-center items-center min-h-[90vh]">
	<div class="w-[80%]">
		<!-- user address select -->
		<div class="mt-5">
			<UserAddresses selectForCheckout={true} {handleAddressSelect} />
		</div>
	</div>

	{#if currentlySelectedAddress}
		<button
			on:click={localAddPurchase}
			class="mt-4 p-4 rounded-lg bg-gray-700 text-gray-100 font-medium fixed bottom-4 right-4 min-w-36"
		>
			{#if checkOutLoading}
				<Loader />
			{:else}
				Checkout
			{/if}
		</button>
	{/if}
</div>
