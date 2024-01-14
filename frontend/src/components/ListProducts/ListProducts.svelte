<script lang="ts">
	// inner imports
	import { sampleProducts, sampleTitle, getProducts } from './ListProducts';
	import ProductCard from '../ProductCard/ProductCard.svelte';

	// props
	export let title = sampleTitle;

	export let params = {};

	// defined variables
	let _products = getProducts(params);
</script>

{#await _products then products}
	<section class="p-20">
		<!-- title -->
		<h1 class="text-3xl font-semibold">{title}</h1>

		<!-- products -->
		<div class="ml-5 grid grid-cols-4 gap-5 place-items-center place-content-center items-center content-center">
			{#each products.products as product}
				<ProductCard {product} />
			{/each}
		</div>
	</section>
{/await}
