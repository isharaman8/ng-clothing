<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import { parseObject } from '../../../utils';
	import { purchaseData } from '../../../stores';
	import { showToast } from '../../../components/misc/Toasts/toasts';
	import { selectCountriesOptions } from '../../../constants';

	// variables
	let { single_order: singleOrder = {} } = store.get(purchaseData);

	$: address = parseObject(singleOrder.address, {});
	$: countryName = _.find(selectCountriesOptions, (country) => country.value === address.country);

	// on mount
	onMount(() => {
		const urlOrderId = $page.params.orderId;

		console.log(singleOrder);

		if (_.isEmpty(singleOrder) || singleOrder.uid !== urlOrderId) {
			showToast('Invalid request', 'order not found', 'error');
			goto('/');
		}
	});
</script>

<div class="mt-24 p-8 flex flex-col justify-center items-center">
	<div class="w-[80%]">
		<h1 class="w-full text-3xl">Order Details</h1>
		<p class="text-[0.8rem] text-gray-700">Ordered on {new Date(singleOrder.created_at).toLocaleString()}</p>

		<!-- summary/details -->
		<div class="w-full rounded-md border border-gray-400 p-3 mt-2 flex justify-between items-center">
			<!-- shipping address -->
			<div class="text-gray-700 text-[0.9rem] leading-6">
				<h3 class="font-semibold">Shipping Address</h3>
				<p>{address.user_name}</p>
				<p>{address.address_line_1}</p>

				{#if address.address_line_2}
					<p>{address.address_line_2}</p>
				{/if}

				<p>{address.city}, {address.state_province} {address.postal_code}</p>
				<p>{countryName?.title}</p>
			</div>

			<!-- order summary -->
			<div class="text-gray-700 text-[0.9rem] leading-6">
				<h3 class="font-semibold">Order Summary</h3>
				<p>Item(s) Subtotal: {singleOrder.total_price}</p>
				<p>Delivery: {0}</p>
				<p>Promotions: {0}</p>
				<p><strong>Grand Total: Rs {singleOrder.total_price}</strong></p>
			</div>
		</div>

		<!-- products -->
		<div class="w-full rounded-md border border-gray-400 p-3 mt-2 flex justify-between items-center">
			<h1 class="text-2xl">Products</h1>
		</div>
	</div>
</div>
