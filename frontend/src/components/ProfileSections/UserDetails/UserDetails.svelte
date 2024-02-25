<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import * as store from 'svelte/store';

	// inner imports
	import { parseArray } from '../../../utils';
	import Loader from '../../misc/Loader.svelte';
	import { authUserData } from '../../../stores';
	import { showToast } from '../../misc/Toasts/toasts';
	import { updateProfile } from '../../../helpers/auth';
	import { defaultToastMessages } from '../../../constants';
	import { handleImageUpload } from '../../../helpers/upload';
	import ImageUploader from '../../ImageUploader/ImageUploader.svelte';
	import LabeledInput from '../../misc/LabeledInput/LabeledInput.svelte';

	// variables
	let file: File;
	let loading = false;
	let userDetails = store.get(authUserData);
	let props = { initialSrc: userDetails?.user?.profile_picture };
	let name = userDetails?.user?.name;
	let email = userDetails?.user?.email;
	let username = userDetails?.user?.username;

	// functions
	function setFile(_file: File) {
		if (_file) {
			file = _file;
		}
	}

	function updateValues(event: any) {
		const varname = event?.target?.name;
		const value = event?.target?.value;

		switch (varname) {
			case 'name':
				name = value;
				break;

			default:
				break;
		}
	}

	async function localUpdateProfile() {
		const updatePayload: any = { name };
		const { success, failure } = defaultToastMessages.updateProfile;

		let updatedUserData: any;

		loading = true;

		try {
			if (file) {
				const returnData = await handleImageUpload(file, userDetails.auth_token);

				if (returnData.error) {
					throw new Error(returnData.message);
				}

				// set profile_picture in updatePayload
				updatePayload['profile_picture'] = _.defaultTo(parseArray(returnData.data.images, [])[0]?.uid, null);
			}

			updatedUserData = await updateProfile(userDetails, updatePayload);

			if (updatedUserData?.error) {
				throw new Error(updatedUserData.message);
			}

			showToast(success.title, success.description, 'success');
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			loading = false;
		}
	}

	// subscribe store
	authUserData.subscribe((data: any) => (userDetails = data));
</script>

<section class="flex flex-col justify-center items-center gap-4">
	<h1 class="text-3xl w-[80%] text-left text-gray-700">Personal Details</h1>

	<ImageUploader {file} onLoad={setFile} {props} />

	<!-- separator -->
	<div class="mt-4" />

	<LabeledInput labelText={'Full Name'} name={'name'} value={name} onInput={updateValues} />
	<LabeledInput labelText={'Email'} name={'email'} value={email} disabled={true} />
	<LabeledInput labelText={'Username'} name={'username'} value={username} disabled={true} />

	<button class="mt-8 bg-gray-100 text-gray-800 p-4 rounded-lg font-semibold" on:click={localUpdateProfile}>
		{#if loading}
			<Loader />
		{:else}
			<section>Update Profile</section>
		{/if}
	</button>
</section>
