<script lang="ts">
	// third party imports
	import _ from 'lodash';

	// props
	export let product: any;
	export let localHandleProductChange: any = () => {};

	// functions
	function handleIncrementDecrement(event: any) {
		let updateType: string | undefined;

		const updatedQty = Number(event.target.value);

		if (updatedQty > product.qty) {
			updateType = 'increment';
		} else if (updatedQty < product.qty) {
			updateType = 'decrement';
		}

		if (updateType) {
			localHandleProductChange({ ...product, qty: Number(event.target.value) }, updateType);
		}
	}

	function handleChangeSize(event: any) {
		let changeSize: string = event.target.value;

		const updateType = 'modify';
		const payload = { ...product, size: changeSize };

		if (changeSize) {
			localHandleProductChange(payload, updateType);
		}
	}

	// variables
	const allSizes = _.keys(product.available_sizes) || ['S', 'M', 'L', 'XL', '2XL', '3XL'];
	const image = product.images[0];
</script>

<div class="flex gap-8 py-4 px-4 mb-4 border-2 border-gray-300 rounded-md">
	<div class="w-[15rem] max-sm:w-[10rem] min-h-[200px] h-[13rem] max-sm:h-[10rem]">
		<img class="w-full h-full object-cover object-top rounded-lg" src={image} alt="product" />
	</div>
	<div>
		<h3 class="text-xl capitalize font-bold">{product.name}</h3>
		<p class="text-sm font-semibold max-sm:text-lg">₹ {product.price}</p>

		<div class="flex gap-4 max-sm:flex-col max-sm:gap-0">
			<div class="flex gap-2 my-4 max-sm:my-2">
				<label for="size" class="font-semibold">Size:</label>
				<select
					id="size"
					name="size"
					class="ml-2 px-2 outline outline-2 outline-gray-300"
					value={product.size}
					on:change={handleChangeSize}
				>
					{#each allSizes as size}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</div>

			<div class="flex gap-2 my-4 max-sm:my-2">
				<label for="quantity" class="font-semibold">Qty:</label>
				<select
					on:change={handleIncrementDecrement}
					id="quantity"
					name="quantity"
					class="ml-2 px-2 outline outline-2 outline-gray-300"
					value={product.qty}
				>
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
				</select>
			</div>
		</div>
		<div>
			<button
				on:click={() => localHandleProductChange(product, 'remove')}
				class="w-full bg-black my-2 text-white py-2 rounded-md">Remove</button
			>
		</div>
	</div>
</div>
