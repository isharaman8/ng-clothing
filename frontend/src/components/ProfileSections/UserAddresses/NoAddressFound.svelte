<script lang="ts">
	// third party imports
	import { AddressCardSolid } from 'flowbite-svelte-icons';

	// props
	export let handleOnClick: any = () => {};
</script>

<div class="w-full flex flex-col justify-center items-center gap-4 min-h-[400px]">
	<AddressCardSolid class="w-28 h-28 text-gray-600" strokeWidth={'1'} />
	<div class="mt-3">
		<h1 class="text-3xl text-gray-600 w-full text-center">No Addresses Found</h1>
		<p class="w-full text-center text-gray-600 mt-3">Tap the button to add new address!</p>
	</div>
	<button on:click={handleOnClick} class="px-3 py-4 rounded-lg bg-gray-700 text-white font-medium mt-8"
		>Add Address</button
	>
</div>
