<script lang="ts">
	// third party imports
	import { page } from '$app/stores';
	import * as store from 'svelte/store';
	import { CartOutline, StarOutline } from 'flowbite-svelte-icons';

	// inner imports
	import { parseArray } from '../../../utils';
	import { authUserData } from '../../../stores';
	import { createOrUpdateCart } from '../../../helpers/cart';
	import Loader from '../../../components/misc/Loader.svelte';
	import { showToast } from '../../../components/misc/Toasts/toasts';
	import { PRODUCT_ACCORDIAN, defaultToastMessages } from '../../../constants';
	import Breadcrumbs from '../../../components/misc/Breadcrumbs/Breadcrumbs.svelte';
	import ProductAccordian from '../../../components/ProductAccordian/ProductAccordian.svelte';

	export let data;

	const { pathname } = $page.url;
	const breadcrumbs = pathname.split('/').slice(1);
	let { product = {} } = data;
	$: ({ product = {} } = data);
	const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
	const defaultImage = 'https://via.placeholder.com/800';
	const sizes = Object.keys(product.available_sizes || {});
	const reviewsCount = product.reviews ? product.reviews.length : 0;
	const singularOrPlural = reviewsCount === 1 ? 'review' : 'reviews';
	const starRating = calculateAverageRating(product.reviews);

	let loading = false;
	let quantity: Number = 1;
	let selectedSize: String = '';
	let userDetails = store.get(authUserData);
	let selectedImage = parseArray(product.images, [])[0] || defaultImage;

	console.log(product);

	// subscribe store
	authUserData.subscribe((data: any) => (userDetails = data));

	function calculateAverageRating(data) {
		let totalRating = 0;
		let numberOfRatings = 0;

		for (const item of data) {
			if (typeof item.rating === 'number' && item.rating >= 0 && item.rating <= 5) {
				totalRating += item.rating;
				numberOfRatings++;
			}
		}

		if (numberOfRatings === 0) {
			return 0;
		}

		const averageRating = totalRating / numberOfRatings;
		return averageRating;
	}

	async function handleAddToCart() {
		const updatePayload: any = {
			products: {
				add: [
					{
						uid: product.uid,
						qty: Number(quantity),
						size: selectedSize
					}
				]
			}
		};

		const { success, failure } = defaultToastMessages.addToCart;

		loading = true;

		try {
			if (quantity && selectedSize.length) {
				const returnData = await createOrUpdateCart(userDetails, updatePayload);

				if (returnData.error) {
					throw new Error(returnData.message || 'Error while adding item to cart');
				}

				showToast(success.title, success.description, 'success');
			}
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			loading = false;
		}
	}
</script>

<section
	class="w-full flex max-sm:flex-col md:max-lg:flex-col mb-10 gap-10 mt-[8rem] max-sm:mt-[6rem] max-sm:gap-4 px-[4rem] max-sm:px-6 min-h-screen"
>
	<div class="hidden max-sm:block md:max-lg:block">
		<Breadcrumbs {product} {breadcrumbs} />
	</div>
	<div class="w-[50%] max-sm:w-full md:max-lg:w-full">
		<div class="flex max-sm:flex-col md:max-lg:flex-col w-full h-full gap-4 overflow-hidden">
			<div class="w-full">
				<img class="h-auto w-full object-cover" src={selectedImage} alt="product-img" />
			</div>
			<div
				class="w-[15%] max-sm:w-full max-sm:flex max-sm:gap-2 md:max-lg:w-full md:max-lg:flex md:max-lg:gap-2 overflow-auto"
			>
				{#each product.images as image (image.uid)}
					<div
						role="button"
						tabindex="0"
						on:keypress={() => (selectedImage = image)}
						on:click={() => (selectedImage = image)}
						class="bg-slate-300 mb-2 max-sm:w-[20%] md:max-lg:w-[20%]"
					>
						<img src={image} alt="img" />
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div class="w-[35%] max-sm:w-full md:max-lg:w-full">
		<div class="max-sm:hidden md:max-lg:hidden">
			<Breadcrumbs {product} {breadcrumbs} />
		</div>
		<h1 class="text-4xl font-bold capitalize">{product.name}</h1>
		<p class="capitalize my-4">{product.description}</p>
		<h2 class="text-2xl font-semibold">₹ {product.price}</h2>
		<p class="text-gray-600 text-sm">Inclusive of all taxes</p>
		<div class="text-sm my-2 flex gap-2">
			{#if reviewsCount}
				<p class="flex gap-1 items-center font-semibold">
					{starRating}
					<span class="flex"
						>{#each Array(5) as _, idx}
							<StarOutline
								class="w-[.9rem] h-[.9rem] text-yellow-700 outline-none"
								strokeWidth="1"
								fill={`${idx + 1 <= starRating ? '#ffc82e' : 'white'}`}
							/>
						{/each}</span
					>
				</p>
				<span>|</span>
			{/if}
			<p>{reviewsCount === 0 ? 'No reviews' : `${reviewsCount} ${singularOrPlural}`}</p>
		</div>
		<hr class="my-2" />
		<p class="font-semibold uppercase">Select size</p>
		<div class="flex flex-wrap gap-4 my-2">
			{#each allSizes as size}
				<button
					on:click={() => (selectedSize = size)}
					class={`${!sizes.includes(size) ? 'cursor-not-allowed bg-gray-300 opacity-50' : 'cursor-pointer bg-white'} ${selectedSize === size && 'outline outline-[1.5px] outline-[#9589ec] text-[#9589ec] font-bold'} border border-gray-400 rounded-sm px-4 py-2`}
					disabled={!sizes.includes(size)}>{size}</button
				>
			{/each}
		</div>
		<div class="flex gap-2 my-4">
			<label for="quantity" class="uppercase font-semibold">Quantity:</label>
			<select id="quantity" name="quantity" class="ml-2 px-2" bind:value={quantity}>
				<option value={1}>1</option>
				<option value={2}>2</option>
				<option value={3}>3</option>
				<option value={4}>4</option>
				<option value={5}>5</option>
			</select>
		</div>
		<div class="flex gap-4 my-5">
			<button
				on:click={handleAddToCart}
				disabled={!selectedSize.length || loading}
				class={`${!selectedSize.length ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} bg-[#9589ec] flex justify-center items-center gap-2 px-[2rem] max-sm:px-4 py-2 font-semibold text-sm rounded-md uppercase w-1/2`}
			>
				{#if !loading}
					<CartOutline class="w-[.8rem]" /> Add to cart
				{:else}
					<Loader borderColor={'border-white-400'} />
				{/if}
			</button>
			<button
				disabled={!selectedSize.length || loading}
				class={`${!selectedSize.length ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} border-2 flex justify-center items-center gap-2 border-gray-400 text-gray-600 px-[3.6rem] max-sm:px-4 py-2 font-semibold text-sm rounded-md uppercase w-1/2`}
			>
				{#if !loading}
					Buy Now
				{:else}
					<Loader borderColor={'border-black'} />
				{/if}
			</button>
		</div>

		<ProductAccordian accordian={PRODUCT_ACCORDIAN.offers} />
		<ProductAccordian accordian={PRODUCT_ACCORDIAN.return_policy} />

		<hr />
		{#if reviewsCount}
			<div class="my-4">
				<h2 class="flex items-center uppercase font-semibold gap-2 mb-4">Ratings <StarOutline class="w-4 h-4" /></h2>
				<div class="mb-2">
					<h1 class="text-4xl font-semibold flex gap-1 items-center">
						{starRating}
						<StarOutline class="w-6 h-6" fill="#949494" strokeWidth="0" />
					</h1>
					<p>{reviewsCount} verified buyer</p>
				</div>
				<hr />
				<h3 class="font-semibold text-lg my-2">Customer reviews ({reviewsCount})</h3>

				{#each product.reviews as review}
					<div>
						<div class="flex items-center gap-2">
							<p
								class={`flex items-center gap-[.1rem] font-semibold text-white px-2 text-[.9rem] ${review.rating <= 2 ? 'bg-red-500' : review.rating === 3 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
							>
								{review.rating}
								<StarOutline class="w-3 h-3" fill="#fff" strokeWidth="0" />
							</p>
							<p>{review.description}</p>
						</div>
						<div class="flex gap-2 items-center ml-12 mt-2 text-sm">
							<h3 class="capitalize">{review.user_name}</h3>
							<span>|</span>
							<p>{review.date || new Date().toDateString()}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
