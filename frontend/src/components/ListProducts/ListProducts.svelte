<script lang="ts">
	// inner imports
	import { sampleTitle } from './ListProducts';
	import ProductCard from '../ProductCard/ProductCard.svelte';

	// third party imports
	import * as store from 'svelte/store';
	import { productData } from '../../stores';
	import ProductSkeletonLoader from '../misc/SkeletonLoaders/Products/ProductSkeletonLoader.svelte';
	import ProductsHeadingSkeletonLoader from '../misc/SkeletonLoaders/Products/ProductsHeadingSkeletonLoader.svelte';

	// props
	export let title = sampleTitle;
	export let loading: boolean = true;

	// variables
	let skeletonLoadingArray = new Array(10);

	let products = store.get(productData);

	const localProducts = JSON.parse(JSON.stringify(products));

	productData.subscribe((data) => (products = data));
</script>

<section class="p-4 md:p-20 lg:p-20 xl:p-20">
	<!-- title -->
	{#if !loading}
		<h1 class="text-3xl font-semibold mb-6">{title}</h1>
	{:else}
		<ProductsHeadingSkeletonLoader />
	{/if}

	<!-- products -->
	<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-8">
		{#if !loading}
			{#each localProducts as product}
				<ProductCard {product} />
			{/each}
		{:else}
			{#each skeletonLoadingArray as _temp}
				<ProductSkeletonLoader />
			{/each}
		{/if}
	</div>
</section>
