<script lang="ts">
	// third party imports
	import { CloseOutline } from 'flowbite-svelte-icons';

	// props
	export let handleClick: any = () => {};
	export let handleOnClose: any = () => {};
</script>

<div class="fixed top-0 right-0 left-0 bottom-0 flex flex-col justify-center items-center backdrop-blur-md">
	<div class="max-w-[80%] max-h-[600px] bg-white p-4 rounded-md">
		<div class="w-full flex justify-between items-center">
			<h1 class="max-w-[80%] text-left text-2xl mb-2 font-medium text-gray-700">Are you sure?</h1>
			<CloseOutline class="text-gray-700 cursor-pointer" on:click={handleOnClose} />
		</div>

		<div class="w-full flex justify-end items-center gap-2">
			<button
				on:click={handleOnClose}
				class="w-28 mt-2 text-white text-sm font-semibold bg-red-700 disabled:bg-red-500 p-2 rounded-md"
			>
				No
			</button>
			<button
				on:click={handleClick}
				class="w-28 mt-2 text-white text-sm font-semibold bg-gray-700 disabled:bg-gray-500 p-2 rounded-md"
			>
				Yes
			</button>
		</div>
	</div>
</div>
