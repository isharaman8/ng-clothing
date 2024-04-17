<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import * as store from 'svelte/store';
	import { CloseOutline } from 'flowbite-svelte-icons';

	// inner imports
	import Loader from '../../misc/Loader.svelte';
	import { parseBoolean } from '../../../utils';
	import { authUserData } from '../../../stores';
	import { showToast } from '../../misc/Toasts/toasts';
	import LabeledInput from '../../misc/LabeledInput/LabeledInput.svelte';
	import LabeledSelect from '../../misc/LabeledSelect/LabeledSelect.svelte';
	import { addOrUpdateUserAddress, deleteUserAddress } from '../../../helpers/user';
	import { defaultToastMessages, selectCountriesOptions } from '../../../constants';

	// functions
	function handleValueChange(event: any) {
		if (event.target.name === 'postal_code') {
			newAddress[event.target.name] = +event.target.value;
		} else {
			newAddress[event.target.name] = event.target.value;
		}
	}

	async function localHandleAddOrUpdateAddress() {
		let success: any, failure: any;

		if (newAddress.uid) {
			success = defaultToastMessages.updateAddress.success;
			failure = defaultToastMessages.updateAddress.failure;
		} else {
			success = defaultToastMessages.addAddress.success;
			failure = defaultToastMessages.addAddress.failure;
		}

		buttonLoading = true;

		try {
			const data = await addOrUpdateUserAddress(userDetails, newAddress, userAddress, userAddress.uid);

			if (data.error) {
				throw new Error(data.message);
			}

			showToast(success.title, success.description, 'success');

			// param as shouldReload
			handleOnClose(true);
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			buttonLoading = false;
		}
	}

	async function localHandleDeleteAddress() {
		let success = defaultToastMessages.deleteAddress.success,
			failure = defaultToastMessages.deleteAddress.failure;

		buttonLoading = true;

		try {
			const data = await deleteUserAddress(userDetails, userAddress.uid);

			if (data.error) {
				throw new Error(data.message);
			}

			showToast(success.title, success.description, 'success');

			// param as shouldReload
			handleOnClose(true);
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			buttonLoading = false;
		}
	}

	// props
	export let userAddress: any = {};
	export let handleOnClose: any = () => {};

	// variables
	const extraLabelClasses = 'w-full';
	const addressInputClasses = 'w-full';
	const nonAddressInputClasses = 'w-full';
	const labeledInputClasses = 'mt-2 w-full flex-col';
	const userDetails: any = store.get(authUserData);

	let newAddress: any = {
		uid: _.defaultTo(userAddress.uid, null),
		type: _.defaultTo(userAddress.type, null),
		city: _.defaultTo(userAddress.city, null),
		active: parseBoolean(userAddress.active, true),
		country: _.defaultTo(userAddress.country, null),
		primary: parseBoolean(userAddress.primary, false),
		user_name: _.defaultTo(userAddress.user_name, null),
		postal_code: _.defaultTo(userAddress.postal_code, null),
		contact_number: _.defaultTo(userAddress.contact_number, null),
		address_line_1: _.defaultTo(userAddress.address_line_1, null),
		address_line_2: _.defaultTo(userAddress.address_line_2, null),
		state_province: _.defaultTo(userAddress.state_province, null),
		user_id: _.defaultTo(userAddress.user_id, userDetails.user.uid)
	};
	let selectTypeOptions = [
		{ value: 'work', title: 'Work' },
		{ value: 'home', title: 'Home' }
	];
	let selectPrimaryOptions = [
		{ value: false, title: 'No' },
		{ value: true, title: 'Yes' }
	];

	let buttonLoading = false;
</script>

<div
	class="fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center backdrop-blur-md max-sm:overflow-auto"
>
	<div class="max-w-[80%] min-w-[70%] max-sm:min-w-[90%] mt-[6rem] max-sm:mt-[50rem] bg-white p-8 rounded-md">
		<div class="w-full flex justify-between items-center">
			<h1 class="max-w-[80%] text-left text-2xl mb-2 font-medium text-gray-700">
				{newAddress.uid === null ? 'Add New Address' : 'Update Address'}
			</h1>
			<CloseOutline class="text-gray-700 cursor-pointer" on:click={() => handleOnClose(false)} />
		</div>
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledSelect
				name={'type'}
				{extraLabelClasses}
				options={selectTypeOptions}
				selectValue={newAddress.type}
				labelHeading={'Address Type'}
				placeholder={'Select Address Type'}
				handleOnChange={handleValueChange}
			/>
			<LabeledSelect
				name={'primary'}
				{extraLabelClasses}
				labelHeading={'Primary'}
				options={selectPrimaryOptions}
				selectValue={newAddress.primary}
				handleOnChange={handleValueChange}
				placeholder={'Is Address Primary'}
			/>
			<LabeledSelect
				name={'country'}
				{extraLabelClasses}
				labelHeading={'Country'}
				options={selectCountriesOptions}
				selectValue={newAddress.country}
				handleOnChange={handleValueChange}
				placeholder={'Select Country'}
			/>
		</div>

		<div class="flex gap-4 max-sm:flex-col">
			<LabeledInput
				name="city"
				labelText="City Name"
				value={newAddress.city}
				placeholder="City Name"
				onInput={handleValueChange}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
			<LabeledInput
				name="user_name"
				labelText="Contact Name"
				placeholder="Contact Name"
				value={newAddress.user_name}
				onInput={handleValueChange}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
		</div>
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledInput
				name="postal_code"
				labelText="Postal Code"
				placeholder="Postal Code"
				onInput={handleValueChange}
				value={newAddress.postal_code}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
			<LabeledInput
				name="contact_number"
				labelText="Contact Number"
				placeholder="Contact Number"
				onInput={handleValueChange}
				value={newAddress.contact_number}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
			<LabeledInput
				placeholder="State/Province"
				name="state_province"
				labelText="State/Province"
				value={newAddress.state_province}
				onInput={handleValueChange}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={nonAddressInputClasses}
			/>
		</div>
		<div class="flex gap-4 max-sm:flex-col">
			<LabeledInput
				name="address_line_1"
				placeholder="Address One"
				labelText="Address Line 1"
				onInput={handleValueChange}
				value={newAddress.address_line_1}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={addressInputClasses}
			/>
			<LabeledInput
				name="address_line_2"
				placeholder="Address Two"
				labelText="Address Line 2"
				onInput={handleValueChange}
				value={newAddress.address_line_2}
				extraLabelClasses={labeledInputClasses}
				extraInputClasses={addressInputClasses}
			/>
		</div>

		<span class="w-full flex max-sm:flex-col justify-between items-center">
			<button
				disabled={buttonLoading}
				on:click={localHandleAddOrUpdateAddress}
				class="mt-4 p-4 rounded-lg bg-gray-700 disabled:bg-gray-500 text-gray-100 font-medium max-sm:w-full"
			>
				{#if buttonLoading}
					<Loader borderColor="border-white" />
				{:else}
					{newAddress.uid === null ? 'Add Address' : 'Update Address'}
				{/if}
			</button>

			{#if userAddress.uid}
				<button
					disabled={buttonLoading}
					on:click={localHandleDeleteAddress}
					class="mt-4 p-4 rounded-lg bg-red-700 disabled:bg-red-500 text-gray-100 font-medium max-sm:w-full"
				>
					{#if buttonLoading}
						<Loader borderColor="border-white" />
					{:else}
						Delete Address
					{/if}
				</button>
			{/if}
		</span>
	</div>
</div>
