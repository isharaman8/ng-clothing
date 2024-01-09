<script lang="ts">
	// inner imports
	import { sampleProducts, sampleTitle } from './ListProducts';
	import ProductCard from '../ProductCard/ProductCard.svelte';

	export let title = sampleTitle;
	export let products = sampleProducts;
</script>

<section class="p-20">
	<!-- title -->
	<h1 class="text-3xl font-semibold">{title}</h1>

	<!-- products -->
	<div class="ml-5 grid grid-cols-4 gap-5 place-items-center place-content-center items-center content-center">
		{#each products as product}
			<ProductCard {product} />
		{/each}
	</div>
</section>
