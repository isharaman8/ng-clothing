<script>
	// inner imports
	import ListProducts from '../components/ListProducts/ListProducts.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="mt-24 w-[100vw] min-h-[88vh]">
	<ListProducts title="Trending" />
</section>
