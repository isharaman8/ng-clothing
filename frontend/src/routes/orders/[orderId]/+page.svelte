<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import { purchaseData } from '../../../stores';
	import { parseArray, parseObject } from '../../../utils';
	import { selectCountriesOptions } from '../../../constants';
	import { showToast } from '../../../components/misc/Toasts/toasts';

	// functions
	function buyAgain() {
		goto(`/`);
	}

	// variables
	let { single_order: singleOrder = {} } = store.get(purchaseData);

	$: address = parseObject(singleOrder.address, {});
	$: products = parseArray(singleOrder.products, []);
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
		<div class="w-full rounded-md border border-gray-400 p-3 mt-2 flex flex-col justify-between items-start gap-3">
			<h1 class="text-2xl">Products</h1>

			<!-- single product -->
			{#each products as product, idx (product.uid)}
				{@const productQty = product.qty}
				{@const productName = product.name}
				{@const productSize = product.size}
				{@const productPrice = product.price}
				{@const productRoute = `/products/${product.uid}`}
				{@const parsedImageArray = parseArray(product?.images, [])}
				{@const borderClasses = idx + 1 < products.length ? 'border-b border-gray-300' : ''}
				{@const image = parsedImageArray[parsedImageArray.length - 1] || 'https://via.placeholder.com/150'}

				<div class={`flex justify-start items-start gap-4 w-full pb-3 relative ${borderClasses}`}>
					<a href={productRoute}>
						<img src={image} alt={productName} class="max-w-20 cursor-pointer" />
					</a>

					<!-- product details -->
					<div>
						<a href={productRoute} class="text-xl hover:underline text-gray-800">{productName}</a>
						<p class="text-[0.8rem] text-gray-700">Size - {productSize}</p>
						<p class="text-[0.8rem] text-gray-700">Rs {productPrice * productQty}</p>
					</div>

					<!-- buy again button -->
					<button class="absolute bottom-2 right-2 rounded-md bg-gray-600 text-white p-2 text-sm">Write a review</button
					>
				</div>
			{/each}
		</div>
	</div>
</div>
