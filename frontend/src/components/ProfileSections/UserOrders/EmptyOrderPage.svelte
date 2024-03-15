<script lang="ts">
	// third party imports
	import { CartOutline } from 'flowbite-svelte-icons';

	export let title: String;
	export let description: String;
	export let buttonName: String;
</script>

<div class="flex flex-col justify-center items-center gap-4 min-h-[400px]">
	<CartOutline class="w-28 h-28 text-gray-600" strokeWidth={'1'} />
	<div class="mt-3">
		<h1 class="text-3xl text-gray-600 w-full text-center">{title}</h1>
		<p class="w-full text-center text-gray-600 mt-3">{description}</p>
	</div>
	<a href="/" class="px-3 py-4 rounded-lg bg-gray-700 text-white font-medium mt-8">{buttonName}</a>
</div>
