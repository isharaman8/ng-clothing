<script lang="ts">
	// props
	export let product: any;
	export let localHandleRemove: any = () => {};

	// variables
	const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
</script>

<div class="flex gap-8 py-4 px-4 border-2 border-gray-300 rounded-md">
	<div class="w-[15rem]">
		<img class="h-auto w-full rounded-lg" src={product.images[0]} alt="product" />
	</div>
	<div>
		<h3 class="text-xl capitalize font-bold">{product.name}</h3>
		<p class="text-sm font-semibold">₹ {product.price}</p>

		<div class="flex gap-4">
			<div class="flex gap-2 my-4">
				<label for="size" class="font-semibold">Size:</label>
				<select id="size" name="size" class="ml-2 px-2 outline outline-2 outline-gray-300" value={product.size}>
					{#each allSizes as size}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</div>

			<div class="flex gap-2 my-4">
				<label for="quantity" class="font-semibold">Qty:</label>
				<select id="quantity" name="quantity" class="ml-2 px-2 outline outline-2 outline-gray-300" value={product.qty}>
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
				</select>
			</div>
		</div>
		<div>
			<button on:click={() => localHandleRemove(product)} class="w-full bg-black my-2 text-white py-2 rounded-md"
				>Remove</button
			>
		</div>
	</div>
</div>
