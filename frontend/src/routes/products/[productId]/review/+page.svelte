<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';
	import { CloseOutline, PlusOutline, StarOutline } from 'flowbite-svelte-icons';

	// inner imports
	import { parseObject } from '../../../../utils';
	import { authUserData, reviewData } from '../../../../stores';
	import { showToast } from '../../../../components/misc/Toasts/toasts';
	import Loader from '../../../../components/misc/Loader.svelte';

	// functions
	function handleStarColoring(idx: number) {
		fillStarsTillIdx = idx + 1;
	}

	function clearStarColoring() {
		fillStarsTillIdx = 0;
	}

	function handleImageChange(event: Event): void {
		let file = parseObject(event.target as HTMLInputElement, {})?.files[0];

		if (!file || !file.type.startsWith('image/')) {
			return; // Show error: Please select an image file
		}

		console.log(file);

		const reader = new FileReader();
		reader.onload = (e) => {
			const imageSrc = e.target ? (e.target.result as string) : '';
			const imagePayload = {
				file,
				image_src: imageSrc
			};

			console.log(imagePayload);

			imageArray = [...imageArray, imagePayload];
		};

		reader.readAsDataURL(file);
	}

	function handleDeleteImage(idx: number) {
		_.pullAt(imageArray, idx);

		imageArray = _.cloneDeep(imageArray);
	}

	// variables
	const startLength = new Array(5);

	let textAreaValue = '';
	let imageArray: any = [];
	let fillStarsTillIdx = 0;
	let buttonLoading = false;
	let fileInput: HTMLInputElement | null = null;
	let userDetails = parseObject(store.get(authUserData), {});
	let { review_product: reviewProduct = {} } = parseObject(store.get(reviewData), {});
	let reviewProductImage: string = _.first(reviewProduct.images) || '';

	// on mount
	onMount(() => {
		if (_.isEmpty(reviewProduct) || _.isEmpty(userDetails)) {
			showToast('Something went wrong', 'Unable to find product', 'error');
			goto('/');
		}
	});
</script>

<div class="mt-24 p-8 flex flex-col justify-center items-center">
	<div class="w-[80%]">
		<h1 class="text-3xl">Create Review</h1>

		<!-- product name and image -->
		<hr class="w-full mt-8" />
		<div class="mt-8 flex justify-start items-start gap-2">
			<img src={reviewProductImage} alt={reviewProduct.name} class="w-8" />
			<h2 class="text-lg text-gray-700">{reviewProduct.name}</h2>
		</div>
		<hr class="w-full mt-8" />

		<!-- rating -->
		<div class="flex justify-between items-start mt-4">
			<div>
				<h2 class="text-xl">Overall Rating</h2>
				<div class="mt-2 flex justify-start items-center gap-2">
					{#each startLength as _start, idx}
						<button on:click={() => handleStarColoring(idx)}>
							<StarOutline
								class="w-10 h-10 text-yellow-500 outline-none"
								strokeWidth="1"
								fill={`${idx + 1 <= fillStarsTillIdx ? '#ffc82e' : 'white'}`}
							/>
						</button>
					{/each}
				</div>
			</div>
			{#if fillStarsTillIdx > 0}
				<button class="text-blue-500 text-md mt-4 hover:underline" on:click={clearStarColoring}>clear</button>
			{/if}
		</div>
		<hr class="w-full mt-8" />

		<!-- upload photo or video -->
		<div class="mt-4">
			<h2 class="text-xl">Add relevant images</h2>
			<p class="text-xs text-gray-600">Shoppers find images more helpful than text alone</p>

			<!-- add support for adding images -->
			<div class="mt-4 flex justify-start items-center flex-wrap gap-4">
				<input type="file" id="fileInput" accept="image/*" on:change={handleImageChange} bind:this={fileInput} hidden />
				<button
					class="flex justify-center items-center rounded border-2 border-dotted border-gray-500 size-36 p-2"
					on:click={() => fileInput?.click()}
				>
					<PlusOutline class="outline-none size-16 text-gray-500" strokeWidth="0.5" />
				</button>

				<!-- images -->
				{#each imageArray as image, idx}
					<div class="relative bg-red-100 w-fit">
						<button class="absolute top-2 right-2 bg-white rounded-full p-2" on:click={() => handleDeleteImage(idx)}>
							<CloseOutline class="size-2" strokeWidth="2" />
						</button>
						<img src={image.image_src} alt={image.file?.name} class="size-36 rounded-md object-center" />
					</div>
				{/each}
			</div>
		</div>
		<hr class="w-full mt-8" />

		<!-- written review -->
		<div class="mt-4 w-full">
			<h2 class="text-xl">Add a written review</h2>
			<textarea
				bind:value={textAreaValue}
				class="mt-2 w-full h-36 p-2 rounded text-gray-700 outline-none"
				placeholder="How would you rate your experience with this clothing purchase?"
			></textarea>

			{#if fillStarsTillIdx > 0}
				<button class="text-blue-500 text-md mt-4 hover:underline" on:click={clearStarColoring}>clear</button>
			{/if}
		</div>
		<hr class="w-full mt-8" />

		<!-- submit button -->
		<div class="w-full flex justify-end items-center">
			<button class="w-28 mt-2 text-white text-sm font-semibold bg-gray-700 p-2 rounded-md">
				{#if buttonLoading}
					<Loader borderColor={'white'} />
				{:else}
					Submit
				{/if}
			</button>
		</div>
	</div>
</div>
