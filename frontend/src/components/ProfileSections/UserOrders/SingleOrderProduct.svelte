<script lang="ts">
	// third party imports
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';

	// inner imports
	import { reviewData } from '../../../stores';

	// props
	export let image: string;
	export let productObj: any;
	export let productQty: number;
	export let productUid: string;
	export let productName: string;
	export let productSize: string;
	export let productRoute: string;
	export let productPrice: number;
	export let borderClasses: string;

	// functions
	function handleWriteReview() {
		reviewStoreDetails['review_product'] = productObj;

		goto(`/products/${productUid}/review`);
	}

	// variables
	let reviewStoreDetails: any = store.get(reviewData);
</script>

<div class={`flex justify-start items-start gap-4 w-full mt-2 pb-2 relative ${borderClasses}`}>
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
	<button on:click={handleWriteReview} class="absolute bottom-2 right-2 rounded-md bg-gray-600 text-white p-2 text-sm"
		>Write a review</button
	>
</div>
