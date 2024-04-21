<script lang="ts">
	import { DEFAULT_IMAGE } from "../../constants";

	export let product: any;
	 
</script>

<a href={`/products/${product.uid}`}>
	<div class="flex flex-col cursor-pointer hover:shadow-md transition-transform ease-in-out">
		<div class="w-full h-[16rem]">
			<img class="object-cover object-top w-full h-full" src={product.images?.[0] || DEFAULT_IMAGE } alt={product.name} />
		</div>
		<div class="px-2 py-2">
			<h1 class="text-sm capitalize font-semibold max-sm:text-lg">{product.name}</h1>
			<p class="text-sm font-bold max-sm:text-lg">₹ {product.price}</p>
		</div>
	</div>
</a>
