<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import Loader from '../../components/misc/Loader.svelte';
	import { authUserData, purchaseData } from '../../stores';
	import { createOrUpdateCart } from '../../helpers/products';
	import { showToast } from '../../components/misc/Toasts/toasts';
	import CartProductCard from '../../components/Cart/cartProductCard.svelte';
	import EmptyOrderPage from '../../components/ProfileSections/UserOrders/EmptyOrderPage.svelte';

	// functions
	async function localCheckout() {
		const payload = { products };
		purchaseData.set(payload);

		goto('/checkout');
	}

	async function handleProductRemove(product: any) {
		const removedProduct = _.find(products, (prd) => prd.uid === product.uid);
		const payload = { products: { remove: [removedProduct] } };

		if (_.isEmpty(removedProduct)) {
			throw new Error('product not found');
		}

		try {
			const returnData = await createOrUpdateCart(userDetails, payload);

			if (returnData.error) {
				throw new Error(returnData.message || 'Error while removing item from cart');
			}

			products = _.filter(products, (prd) => prd.uid !== removedProduct.uid);
		} catch (error: any) {
			console.log('removed product', removedProduct);
			showToast('something went wrong', error.message, 'error');
		}
	}

	// props
	export let data;

	// variables
	const { cart = {} } = data;

	let checkOutLoading = false;
	let { products = [] } = cart;
	let userDetails = store.get(authUserData);

	$: noItemsInCart = !products.length;
	$: totalProducts = products.length || 0;
</script>

<section class="mt-[8rem] px-[10rem]">
	{#if noItemsInCart}
		<EmptyOrderPage
			title="Hey, it feels so light!"
			description="There is nothing in your bag. Lets add some items."
			buttonName="Shop Now"
		/>
	{:else}
		<h1 class="text-4xl font-bold mb-2 uppercase">Your bag</h1>
		<p>
			Total ({totalProducts}) {totalProducts.length > 1 ? 'items' : 'item'}
			<span class="text-xl font-bold">₹{cart.total_price}</span>
		</p>
		<div class="w-full my-4 flex gap-20">
			<div class="w-[50%]">
				{#each products as product (product.uid)}
					<CartProductCard {product} localHandleRemove={handleProductRemove} />
				{/each}
			</div>
			<div class="w-auto">
				<div class="py-4 px-6 border-2 border-gray-300 rounded-md w-[20rem]">
					<h2 class="text-2xl font-semibold mb-5">Order Summary</h2>
					<div class="flex justify-between mb-2">
						<p>{totalProducts} {totalProducts.length > 1 ? 'items' : 'item'}</p>
						<p>₹{cart.total_price}</p>
					</div>
					<div class="flex justify-between mb-2">
						<p>Delivery</p>
						<p>Free</p>
					</div>
					<hr />
					<div class="flex justify-between font-bold mt-2">
						<p>Total</p>
						<p>₹{Number(cart.total_price) + 63.67}</p>
					</div>
					<p class="text-gray-400 text-sm">(Inclusive of tax ₹63.67)</p>
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
				</div>
			</div>
		</div>
	{/if}
</section>
