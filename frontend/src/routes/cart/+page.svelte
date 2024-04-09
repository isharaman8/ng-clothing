<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import { getUserCart } from '../../helpers/cart';
	import { parseArray, parseObject } from '../../utils';
	import Loader from '../../components/misc/Loader.svelte';
	import { authUserData, purchaseData } from '../../stores';
	import { createOrUpdateCart } from '../../helpers/products';
	import { showToast } from '../../components/misc/Toasts/toasts';
	import CartProductCard from '../../components/Cart/cartProductCard.svelte';
	import EmptyOrderPage from '../../components/ProfileSections/UserOrders/EmptyOrderPage.svelte';
	import CartOrderSummary from '../../components/misc/SkeletonLoaders/Cart/CartOrderSummary.svelte';
	import CartHeadingSkeletonLoader from '../../components/misc/SkeletonLoaders/Cart/CartHeadingSkeletonLoader.svelte';
	import CartProductSkeletonLoader from '../../components/misc/SkeletonLoaders/Cart/CartProductSkeletonLoader.svelte';

	// functions
	async function localCheckout() {
		const payload = { products };
		purchaseData.set(payload);

		goto('/checkout');
	}

	async function HandleProductChange(product: any, type: 'decrement' | 'remove' | 'increment' | 'modify') {
		const addedProducts = [];
		const removedProducts = [];
		const modifiedProducts = [];
		const reqdProduct = _.find(products, (prd) => prd.uid === product.uid);

		if (_.isEmpty(reqdProduct)) {
			throw new Error('product not found');
		}

		if (_.includes(['remove', 'decrement'], type)) {
			if (type === 'decrement') {
				const decrementValue = reqdProduct.qty - product.qty;

				reqdProduct.qty = decrementValue;
			} else if (type === 'remove') {
				reqdProduct.qty = reqdProduct.qty;
			}

			removedProducts.push(reqdProduct);
		} else if (_.includes(['increment'], type)) {
			const qtyToBeIncremented = product.qty - reqdProduct.qty;

			reqdProduct.qty = qtyToBeIncremented;

			addedProducts.push(reqdProduct);
		} else if (_.includes(['modify'], type)) {
			modifiedProducts.push(product);
		}

		const payloadProducts: any = {};

		if (!_.isEmpty(addedProducts)) {
			payloadProducts['add'] = addedProducts;
		}

		if (!_.isEmpty(removedProducts)) {
			payloadProducts['remove'] = removedProducts;
		}

		if (!_.isEmpty(modifiedProducts)) {
			payloadProducts['modify'] = modifiedProducts;
		}

		const payload = { products: payloadProducts };

		try {
			const returnData = await createOrUpdateCart(userDetails, payload);

			if (returnData.error) {
				throw new Error(returnData.message || 'Error while removing item from cart');
			}

			cart = parseObject(returnData.data?.cart, {});
		} catch (error: any) {
			showToast('something went wrong', error.message, 'error');
		}
	}

	async function localGetUserCart() {
		loading = true;

		try {
			const data = await getUserCart(userDetails);

			if (data.error) {
				throw new Error(data.message);
			}

			cart = data.data;
		} catch (error: any) {
			showToast('something went wrong', error.message, 'error');
		} finally {
			loading = false;
		}
	}

	// variables
	let cart: any = {};
	let loading = false;
	let checkOutLoading = false;
	let userDetails = store.get(authUserData);

	const skeletonLoaderCartProductArray = new Array(2);

	$: products = parseArray(cart.products, []);
	$: total_price = _.defaultTo(cart.total_price, 0);
	$: noItemsInCart = !products.length;
	$: totalProducts = _.defaultTo(products.length, 0);

	// on mount
	onMount(localGetUserCart);
</script>

<section class="mt-[8rem] px-[10rem] max-sm:px-6 md:max-lg:px-6">
	{#if noItemsInCart && !loading}
		<EmptyOrderPage
			title="Hey, it feels so light!"
			description="There is nothing in your bag. Lets add some items."
			buttonName="Shop Now"
		/>
	{:else}
		{#if loading}
			<CartHeadingSkeletonLoader />
		{:else}
			<h1 class="text-4xl font-bold mb-2 uppercase">Your bag</h1>
			<p>
				Total ({totalProducts}) {totalProducts.length > 1 ? 'items' : 'item'}
				<span class="text-xl font-bold">₹{total_price}</span>
			</p>
		{/if}
		<div class="w-full my-4 flex max-sm:flex-col gap-20 md:max-lg:gap-10">
			<div class="w-[50%] max-sm:w-full">
				{#if loading}
					{#each skeletonLoaderCartProductArray as _temp}
						<CartProductSkeletonLoader />
					{/each}
				{:else}
					{#each products as product (product.uid)}
						<CartProductCard {product} localHandleProductChange={HandleProductChange} />
					{/each}
				{/if}
			</div>
			<div class="w-auto">
				<div class="py-4 px-6 border-2 border-gray-300 rounded-md w-[20rem] max-sm:w-full">
					{#if !loading}
						<h2 class="text-2xl font-semibold mb-5">Order Summary</h2>
						<div class="flex justify-between mb-2">
							<p>{totalProducts} {totalProducts.length > 1 ? 'items' : 'item'}</p>
							<p>₹{total_price}</p>
						</div>
						<div class="flex justify-between mb-2">
							<p>Delivery</p>
							<p>Free</p>
						</div>
						<hr />
						<div class="flex justify-between font-bold mt-2">
							<p>Total</p>
							<p>₹{Number(total_price)}</p>
						</div>
						<button
							on:click={localCheckout}
							class="w-full bg-black my-2 text-white py-2 rounded-md flex justify-center items-center"
						>
							{#if checkOutLoading}
								<Loader />
							{:else}
								Checkout
							{/if}
						</button>
					{:else}
						<CartOrderSummary />
					{/if}
				</div>
			</div>
		</div>
	{/if}
</section>
