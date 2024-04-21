<script lang="ts">
	// props
	export let image: string;
	export let productQty: number;
	export let productName: string;
	export let productSize: string;
	export let productRoute: string;
	export let productPrice: number;
	export let borderClasses: string;
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
	<button class="absolute bottom-2 right-2 rounded-md bg-gray-600 text-white p-2 text-sm">Write a review</button>
</div>
