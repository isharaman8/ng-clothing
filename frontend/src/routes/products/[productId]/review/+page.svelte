<script lang="ts">
	// third party imports
	import _ from 'lodash';

	// inner imports
	import * as store from 'svelte/store';
	import { reviewData } from '../../../../stores';
	import { parseObject } from '../../../../utils';
	import { StarOutline } from 'flowbite-svelte-icons';

	// functions
	function handleStarColoring(idx: number) {
		fillStarsTillIdx = idx + 1;
	}

	function clearStarColoring() {
		fillStarsTillIdx = 0;
	}

	// variables
	const startLength = new Array(5);

	let fillStarsTillIdx = 0;
	let { review_product: reviewProduct } = parseObject(store.get(reviewData), {});
	let reviewProductImage: string = _.first(reviewProduct.images) || '';

	$: {
		console.log(reviewProduct);
		console.log(fillStarsTillIdx);
	}
</script>

<div class="mt-24 p-8 flex flex-col justify-center items-center">
	<div class="w-[80%]">
		<h1 class="text-3xl">Create Review</h1>

		<!-- product name and image -->
		<hr class="w-full mt-8" />
		<div class="mt-8 flex justify-start items-start gap-2">
			<img src={reviewProductImage} alt={reviewProduct.name} class="w-8" />
			<h2 class="text-lg text-gray-700">{reviewProduct.name}</h2>
		</div>
		<hr class="w-full mt-8" />

		<!-- rating -->
		<div class="flex justify-between items-start mt-4">
			<div>
				<h2 class="text-xl">Overall Rating</h2>
				<div class="mt-2 flex justify-start items-center gap-2">
					{#each startLength as _start, idx}
						<button on:click={() => handleStarColoring(idx)}>
							<StarOutline
								class={`w-10 h-10 text-yellow-500`}
								strokeWidth="1"
								fill={`${idx + 1 <= fillStarsTillIdx ? '#ffc82e' : 'white'}`}
							/>
						</button>
					{/each}
				</div>
			</div>
			{#if fillStarsTillIdx > 0}
				<button class="text-blue-500 text-md mt-4 hover:underline" on:click={clearStarColoring}>clear</button>
			{/if}
		</div>
		<hr class="w-full mt-8" />

		<!-- upload photo or video -->
		<div class="mt-4">
			<h2 class="text-xl">Add relevant images</h2>
			<p class="text-xs text-gray-600">Shoppers find images more helpful than text alone</p>
		</div>
	</div>
</div>
