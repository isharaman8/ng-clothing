<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';

	// inner imports
	import { parseArray } from '../../../utils';
	import { authUserData } from '../../../stores/';
	import { showToast } from '../../misc/Toasts/toasts';
	import NoAddressFound from './NoAddressFound.svelte';
	import { getUserAddresses } from '../../../helpers/user';
	import SingleUserAddressCard from './SingleUserAddressCard.svelte';
	import AddOrEditUserAddressPopup from './AddOrEditUserAddressPopup.svelte';
	import AddressSkeletonLoader from '../../misc/SkeletonLoaders/AddressSkeletonLoader.svelte';

	// functions
	async function localFetchUserAddresses() {
		addressLoading = true;

		try {
			const tempData = await getUserAddresses(userDetails);

			if (tempData.error) {
				throw new Error(tempData.message);
			}

			if (_.isEmpty(tempData.data)) {
				noAddressFound = true;
			} else {
				userAddresses = parseArray(tempData.data, []);
			}
		} catch (error: any) {
			showToast('something went wrong', error.message, 'error');
		} finally {
			addressLoading = false;
		}
	}

	function selectAddressForEdit(address: any) {
		currentAddressForEdit = address;

		openPopup();
	}

	function closePopup(shouldFetchAgain: boolean) {
		if (shouldFetchAgain) {
			localFetchUserAddresses();
		}

		addOrUpdatePopupOpen = false;
	}

	function openPopup() {
		addOrUpdatePopupOpen = true;
	}

	function localSelectAddress(userAddressData: any) {
		selectedAddress = userAddressData.uid;
		handleAddressSelect(userAddressData);
	}

	// props
	export let selectForCheckout: boolean = false;
	export let handleAddressSelect: any = () => {};

	// variables
	const userDetails = store.get(authUserData);

	let addressLoading = false;
	let noAddressFound = false;
	let userAddresses: any = [];
	let currentAddressForEdit: any;
	let selectedAddress: any = null;
	let addOrUpdatePopupOpen = false;
	let skeletonLoaderArray = new Array(9);

	// apply on mount
	onMount(localFetchUserAddresses);
</script>

<section class="flex flex-col justify-center items-center  max-sm:items-start gap-5">
	<h1 class="text-3xl w-[80%] max-sm:w-full text-left text-gray-700">
		{selectForCheckout ? 'Select Address For Checkout' : 'Manage Addresses'}
	</h1>

	{#if noAddressFound}
		<NoAddressFound handleOnClick={() => selectAddressForEdit({})} />
	{:else}
		<div class="w-[80%] grid grid-cols-3 gap-4">
			{#if addressLoading}
				{#each skeletonLoaderArray as _temp}
					<AddressSkeletonLoader />
				{/each}
			{:else}
				{#each userAddresses as address}
					<SingleUserAddressCard
						{selectedAddress}
						{selectForCheckout}
						userAddressData={address}
						onClick={selectAddressForEdit}
						handleAddressSelect={localSelectAddress}
					/>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- add or edit user address popup -->
	{#if addOrUpdatePopupOpen}
		<AddOrEditUserAddressPopup userAddress={currentAddressForEdit} handleOnClose={closePopup} />
	{/if}

	<!-- bottom button for adding new address -->
	{#if !noAddressFound && !selectForCheckout}
		<button
			on:click={() => selectAddressForEdit({})}
			class="mt-4 p-4 rounded-lg bg-gray-700 text-gray-100 font-medium fixed bottom-4 right-4"
		>
			Add New Address
		</button>
	{/if}
</section>
