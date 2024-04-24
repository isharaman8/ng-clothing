<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';
	import { CloseOutline, ExclamationCircleOutline, PlusOutline, StarOutline } from 'flowbite-svelte-icons';

	// inner imports
	import { parseArray, parseObject } from '../../../../utils';
	import { authUserData, reviewData } from '../../../../stores';
	import Loader from '../../../../components/misc/Loader.svelte';
	import { handleImageUpload } from '../../../../helpers/upload';
	import { showToast } from '../../../../components/misc/Toasts/toasts';
	import { createOrUpdateReviewFeedback } from '../../../../helpers/products';
	import ConfirmationPopup from '../../../../components/misc/Popups/ConfirmationPopup.svelte';

	// functions
	function handleStarColoring(idx: number) {
		fillStarsTillIdx = idx + 1;
		startRatingError = false;
	}

	function clearStarColoring() {
		fillStarsTillIdx = 0;
	}

	function handleImageChange(event: Event): void {
		let file = parseObject(event.target as HTMLInputElement, {})?.files[0];

		if (!file || !file.type.startsWith('image/')) {
			return; // Show error: Please select an image file
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const imageSrc = e.target ? (e.target.result as string) : '';
			const imagePayload = {
				file,
				image_src: imageSrc
			};

			imageArray = [...imageArray, imagePayload];
		};

		reader.readAsDataURL(file);
	}

	function handleDeleteImage(idx: number) {
		_.pullAt(imageArray, idx);

		imageArray = _.cloneDeep(imageArray);
	}

	async function populateExistingReviewData() {
		const reqdReviewData: any =
			_.find(
				allProductReviews,
				(review) => review.user_id === userDetails.user.uid && review.product_id === reviewProduct.uid
			) || {};

		// set default values
		oldReview = reqdReviewData;
		imageArray = parseArray(reqdReviewData.images, []);
		fillStarsTillIdx = _.defaultTo(reqdReviewData.rating, 0);
		textAreaValue = _.defaultTo(reqdReviewData.description, '');
	}

	async function submitReviewData() {
		if (fillStarsTillIdx === 0 || _.isEmpty(textAreaValue)) {
			if (fillStarsTillIdx === 0) {
				startRatingError = true;
			}

			if (_.isEmpty(textAreaValue)) {
				writtenReviewError = true;
			}

			return;
		}

		buttonLoading = true;

		let payload: any = {};

		try {
			if (!_.isEmpty(imageArray)) {
				const fileArray = _.filter(imageArray, (obj) => obj.file).map((obj) => obj.file);
				const alreadyPresentImageUids = _.compact(_.map(imageArray, (obj) => obj.uid));

				let uploadedImageData: any;

				if (!_.isEmpty(fileArray)) {
					uploadedImageData = await handleImageUpload(fileArray, userDetails.auth_token);

					if (uploadedImageData.error) {
						throw new Error(uploadedImageData.message || '');
					}

					const imageData = uploadedImageData.data.images,
						uploadedImageUids = _.compact(_.map(imageData, (obj) => obj.uid));

					alreadyPresentImageUids.push(...uploadedImageUids);
				}

				payload['images'] = alreadyPresentImageUids;
			}

			payload['rating'] = fillStarsTillIdx;
			payload['description'] = textAreaValue;

			const returnedReviewData = await createOrUpdateReviewFeedback(
				userDetails,
				reviewProduct.uid,
				payload,
				oldReview,
				oldReview.uid
			);

			if (returnedReviewData.error) {
				throw new Error(returnedReviewData.message || '');
			}

			showToast('Review added successfully', 'review added successfully', 'success');
			goto('/');
		} catch (error: any) {
			showToast('Something went wrong', error.message, 'error');
		} finally {
			buttonLoading = false;
		}
	}

	function closePopup() {
		popupOpen = false;
	}

	function openPopup() {
		popupOpen = true;
	}

	function cancelReview() {
		reviewData.set({});

		closePopup();
		goto('/');
	}

	// variables
	const startLength = new Array(5);

	let popupOpen = false;
	let textAreaValue = '';
	let imageArray: any = [];
	let fillStarsTillIdx = 0;
	let buttonLoading = false;
	let startRatingError = false,
		writtenReviewError = false;

	let oldReview: any = {};
	let fileInput: HTMLInputElement | null = null;
	let userDetails = parseObject(store.get(authUserData), {});
	let { review_product: reviewProduct = {}, all_products_reviews: allProductReviews = [] } = parseObject(
		store.get(reviewData),
		{}
	);
	let reviewProductImage: string = _.first(reviewProduct?.images) || '';

	// on mount
	onMount(async () => {
		if (_.isEmpty(reviewProduct) || _.isEmpty(userDetails)) {
			showToast('Something went wrong', 'Unable to find product', 'error');
			goto('/');
		}

		await populateExistingReviewData();
	});
</script>

<div class="mt-24 p-8 flex flex-col justify-center items-center">
	<div class="w-[80%]">
		<h1 class="text-3xl">Create Review</h1>

		<!-- product name and image -->
		<hr class="w-full mt-8" />
		<div class="mt-8 flex justify-start items-start gap-2">
			<img src={reviewProductImage} alt={reviewProduct?.name} class="w-10" />
			<h2 class="text-lg text-gray-700">{reviewProduct?.name}</h2>
		</div>
		<hr class="w-full mt-8" />

		<!-- rating -->
		<div class="flex justify-between items-start mt-4">
			<div>
				<h2 class="text-xl">Overall Rating</h2>

				{#if startRatingError}
					<p class="flex justify-start items-center gap-1 mt-2 text-xs text-red-700">
						<ExclamationCircleOutline class="size-4" /> Please select a start rating
					</p>
				{/if}

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
					{@const imgSrc = image.image_src || image.url}
					{@const imgName = image.key || image.file?.name}

					<div class="relative bg-red-100 w-fit">
						<button class="absolute top-2 right-2 bg-white rounded-full p-2" on:click={() => handleDeleteImage(idx)}>
							<CloseOutline class="size-2" strokeWidth="2" />
						</button>
						<img src={imgSrc} alt={imgName} class="size-36 rounded-md object-center" />
					</div>
				{/each}
			</div>
		</div>
		<hr class="w-full mt-8" />

		<!-- written review -->
		<div class="mt-4 w-full">
			<h2 class="text-xl">Add a written review</h2>
			{#if writtenReviewError}
				<p class="flex justify-start items-center gap-1 my-2 text-xs text-red-700">
					<ExclamationCircleOutline class="size-4" /> Please add a written review
				</p>
			{/if}
			<textarea
				on:input={() => (writtenReviewError = false)}
				bind:value={textAreaValue}
				class="mt-2 w-full h-36 p-2 rounded text-gray-700 outline-none"
				placeholder="How would you rate your experience with this clothing purchase?"
			></textarea>
		</div>
		<hr class="w-full mt-8" />

		<!-- submit button -->
		<div class="w-full flex justify-end items-center gap-2">
			<button
				disabled={buttonLoading}
				on:click={openPopup}
				class="w-28 mt-2 text-white text-sm font-semibold bg-red-700 disabled:bg-red-500 p-2 rounded-md"
			>
				{#if buttonLoading}
					<Loader borderColor={'white'} />
				{:else}
					Cancel
				{/if}
			</button>

			<button
				disabled={buttonLoading}
				on:click={submitReviewData}
				class="w-28 mt-2 text-white text-sm font-semibold bg-gray-700 disabled:bg-gray-500 p-2 rounded-md"
			>
				{#if buttonLoading}
					<Loader borderColor={'white'} />
				{:else}
					Submit
				{/if}
			</button>
		</div>
	</div>

	<!-- popup -->
	{#if popupOpen}
		<ConfirmationPopup handleClick={cancelReview} handleOnClose={closePopup} />
	{/if}
</div>
