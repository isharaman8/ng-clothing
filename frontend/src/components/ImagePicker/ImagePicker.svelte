<script lang="ts">
	// third party imports
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';

	// inner imports
	import { authUserData } from '../../stores';
	import { showToast } from '../misc/Toasts/toasts';
	import { getUserUploads } from '../../helpers/upload';
	import { parseArray, parseObject } from '../../utils';
	import { CloseOutline, ImageOutline } from 'flowbite-svelte-icons';
	import ImagePickerSkeletonLoader from '../misc/SkeletonLoaders/ImagePickerSkeletonLoader.svelte';

	// functions
	async function localFetchUserUploads() {
		uploadLoading = true;

		try {
			const tempUploads = await getUserUploads(userDetails);

			if (tempUploads.error) {
				throw new Error(tempUploads.message);
			}

			userUploads = parseArray(tempUploads.data, []);
		} catch (error: any) {
			showToast('Something went wrong', error.message, 'error');
		} finally {
			uploadLoading = false;
		}
	}

	function handleImageChange(event: Event): void {
		let file = parseObject(event.target as HTMLInputElement, {})?.files[0];

		if (!file || !file.type.startsWith('image/')) {
			return; // Show error: Please select an image file
		}

		const reader = new FileReader();
		reader.onload = () => {
			handleNewImagePick(file);
		};

		reader.readAsDataURL(file);
	}

	// props
	export let handleOnClose: any = () => {};
	export let handleNewImagePick: any = () => {};
	export let handleOldImagePick: any = () => {};

	// variables
	let uploadLoading = true;
	let userUploads: any = [];
	let fileInput: HTMLInputElement | null = null;

	const skeletonLoaderArray = new Array(9);
	const userDetails = store.get(authUserData);

	// on mount
	onMount(localFetchUserUploads);
</script>

<div class="fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center backdrop-blur-md">
	<div class="max-w-[80%] max-h-[600px] bg-white p-4 rounded-md">
		<div class="w-full flex justify-between items-center">
			<h1 class="max-w-[80%] text-left text-2xl mb-2 font-medium text-gray-700">Select Image</h1>
			<CloseOutline class="text-gray-700 cursor-pointer" on:click={handleOnClose} />
		</div>

		<div class="grid grid-cols-3 overflow-y-scroll gap-2" style="scrollbar-width: none; -ms-overflow-style: none;">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			{#if uploadLoading}
				{#each skeletonLoaderArray as _temp}
					<ImagePickerSkeletonLoader />
				{/each}
			{:else}
				<ImageOutline
					class="h-40 w-40 text-gray-700 cursor-pointer"
					strokeWidth={'1'}
					on:click={() => fileInput?.click()}
				/>

				<label
					for="fileInput"
					class="cursor-pointer hidden bg-gray-200 hover:bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded-md shadow-sm"
				>
					<input
						type="file"
						id="fileInput"
						accept="image/*"
						on:change={handleImageChange}
						bind:this={fileInput}
						hidden
					/>
					Choose Image
				</label>

				{#each userUploads as upload (upload.uid)}
					<img
						class="h-40 w-40 rounded-md cursor-pointer"
						src={upload.url}
						alt={upload.key}
						on:click={() => handleOldImagePick(upload)}
					/>
				{/each}
			{/if}
		</div>
	</div>
</div>
