<script lang="ts">
	// inner imports
	import { sampleTitle } from './ListProducts';
	import ProductCard from '../ProductCard/ProductCard.svelte';

	// third party imports
	import * as store from 'svelte/store';
	import { productData } from '../../stores';

	// props
	export let title = sampleTitle;

	$: products = store.get(productData);

	productData.subscribe((data) => (products = data));
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
