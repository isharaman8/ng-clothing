<script lang="ts">
	import { FileSearchOutline } from 'flowbite-svelte-icons';
	import { DEFAULT_IMAGE } from '../../constants';

	export let products: any;

	$: noResult = !products.length;
</script>

<div
	id="searchBox"
	class="absolute top-14 h-[80vh] max-sm:h-screen max-sm:pb-20 bg-white overflow-y-auto w-full rounded-md py-4"
>
	{#if noResult}
		<div class="flex items-center justify-center">
			<FileSearchOutline class="text-center h-10 w-10 opacity-40" />
		</div>
		<p id="searchResult" class="text-center">Oops! Couldn't find what you are looking for</p>
		<p id="searchResult" class="text-center">Try something else</p>
	{:else}
		<p id="searchTitle" class="font-semibold px-4 mb-3 text-xl">Trending now</p>
	{/if}
	<div class="w-full">
		{#each products as product (product.uid)}
			<a href={`/products/${product.uid}`}>
				<div
					class="flex px-4 py-2 items-center border-b-2 gap-4 cursor-pointer hover:bg-gray-100 hover:pl-5 hover:font-bold transition-all duration-200"
				>
					<div class="w-[6rem] h-[6rem] flex items-center justify-center relative">
						<img class="w-full h-full object-cover object-top" src={product.images[0] || DEFAULT_IMAGE} alt="product" />
					</div>
					<div>
						<p class="capitalize">{product.name}</p>
						<p class="text-blue-700 font-semibold">in {product.category_name || 'Sarees'}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
