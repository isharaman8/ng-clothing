<script lang="ts">

	export let product: any;
	 
	const defaultImg = 'https://via.placeholder.com/150';
</script>

<a href={`products/${product.uid}`}>
	<div class="flex flex-col cursor-pointer hover:shadow-md transition-transform ease-in-out">
		<img src={product.images?.[0] || defaultImg } alt={product.name} />
		<div class="px-2 py-2">
			<h1 class="text-sm font-semibold">{product.name}</h1>
			<p class="text-sm font-bold">₹ {product.price}</p>
		</div>
	</div>
</a>
