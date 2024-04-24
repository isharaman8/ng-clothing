<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import { STATUS_DETAILS } from '../../../constants';
	import { parseArray, parseObject } from '../../../utils';
	import { selectCountriesOptions } from '../../../constants';
	import { getProductReviews } from '../../../helpers/products';
	import { showToast } from '../../../components/misc/Toasts/toasts';
	import { authUserData, purchaseData, reviewData } from '../../../stores';
	import SingleOrderProduct from '../../../components/ProfileSections/UserOrders/SingleOrderProduct.svelte';

	// functions
	async function getProductsReviews() {
		const productUids = _.map(products, (product) => product.uid);

		try {
			const queryParams = { user_id: userDetails.user.uid, product_uid: _.join(productUids, ',') };
			const returnData = await getProductReviews(queryParams);

			if (returnData.error) {
				throw new Error(returnData.message);
			}

			const reqdReviewData: any = parseArray(returnData.data, []);
			console.log('reqdReviewData', reqdReviewData);

			allProductReviews = reqdReviewData;
			storeReviewData['all_products_reviews'] = reqdReviewData;

			// set default values
		} catch (error: any) {
			showToast('Something went wrong', error.message, 'error');
		}
	}

	// variables
	let allProductReviews: any = [];
	let userDetails = store.get(authUserData);
	let { single_order: singleOrder = {} } = store.get(purchaseData);
	let storeReviewData = parseObject(store.get(reviewData), {});
	let {
		text: statusTextColor,
		background: statusBackgroundColor,
		enriched_value: statusEnrichedValue
	} = parseObject(STATUS_DETAILS[singleOrder.status], {});
	let deliveredOnDate = new Date(singleOrder.updated_at).toLocaleString();

	$: address = parseObject(singleOrder.address, {});
	$: products = parseArray(singleOrder.products, []);
	$: countryName = _.find(selectCountriesOptions, (country) => country.value === address.country);

	// on mount
	onMount(async () => {
		const urlOrderId = $page.params.orderId;

		if (_.isEmpty(singleOrder) || singleOrder.uid !== urlOrderId) {
			showToast('Invalid request', 'order not found', 'error');
			goto('/');
		}

		await getProductsReviews();
	});
</script>

<div class="mt-24 p-8 flex flex-col justify-center items-center">
	<div class="w-[80%]">
		<div class="flex justify-between items-end">
			<div>
				<h1 class="w-full text-3xl">Order Details</h1>
				<p class="text-[0.8rem] text-gray-700">Ordered on {new Date(singleOrder.created_at).toLocaleString()}</p>
			</div>

			<p class={`${statusTextColor} ${statusBackgroundColor} p-2 font-semibold text-sm rounded-md`}>
				{statusEnrichedValue}
			</p>
		</div>

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
		<div class="w-full rounded-md border border-gray-400 mt-2 flex flex-col justify-between items-start gap-3">
			<div class="rounded-t-md w-full bg-gray-300 px-3 py-2 border-b border-gray-400">
				<h1 class="text-2xl">Products</h1>
				{#if ['delivered', 'fulfilled'].includes(singleOrder.status)}
					<p class="text-[0.8rem] text-gray-600">Order delivered on {deliveredOnDate}</p>
				{/if}
			</div>

			<div class="p-3 w-full">
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

					<SingleOrderProduct
						{image}
						{productQty}
						{productName}
						{productSize}
						{productRoute}
						{productPrice}
						{borderClasses}
						productObj={product}
						productUid={product.uid}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>
