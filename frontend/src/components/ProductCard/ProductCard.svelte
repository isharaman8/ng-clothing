<script lang="ts">
	export let product: any;
</script>

<section class="flex flex-col justify-center items-center">
	<img src={product.images?.[0]} alt={product.name} />
	<h1>{product.name}</h1>
</section>
