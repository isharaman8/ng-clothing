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
	<h1 class="text-3xl font-semibold mb-6">{title}</h1>

	<!-- products -->
	<div class="grid grid-cols-5 gap-8">
		{#each products as product}
			<ProductCard {product} />
		{/each}
	</div>
</section>
