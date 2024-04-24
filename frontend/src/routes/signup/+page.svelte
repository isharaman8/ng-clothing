<script lang="ts">
	// inner imports
	import '../../styles/login_signup.css';

	import { parseArray } from '../../utils';
	import { authUserData } from '../../stores';
	import { defaultToastMessages } from '../../constants';
	import { handleImageUpload } from '../../helpers/upload';
	import Loader from '../../components/misc/Loader.svelte';
	import { signup, updateProfile } from '../../helpers/auth';
	import { showToast } from '../../components/misc/Toasts/toasts';
	import ImageUploader from '../../components/ImageUploader/ImageUploader.svelte';

	// third party imports
	import _ from 'lodash';
	import { goto } from '$app/navigation';

	// variables
	let name = '';
	let email = '';
	let file: File;
	let password = '';
	let username = '';
	let loading = false;

	// functions
	function setFile(_file: File) {
		if (_file) {
			file = _file;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		const { failure, success } = defaultToastMessages.signup;

		let returnValue: any;

		loading = true;

		try {
			const signupData = { name, email, password, username };
			const tempValue = await signup(signupData);

			if (tempValue.error) {
				throw new Error(tempValue.message || '');
			}

			returnValue = tempValue.data;

			if (file) {
				const returnData = await handleImageUpload(file, returnValue.auth_token);

				if (returnData.error) {
					throw new Error(returnData.message || '');
				}

				// update profile_picture
				const profilePictureUid = _.defaultTo(parseArray(returnData.data, [])[0]?.uid, null);
				const updateProfilePayload = { profile_picture: profilePictureUid };
				const updatedProfileData = await updateProfile(returnValue, updateProfilePayload);

				if (updatedProfileData.error) {
					throw new Error(updatedProfileData.message || '');
				}

				returnValue['user'] = updatedProfileData.data.user;
			}

			authUserData.set(returnValue);

			showToast(success.title, success.description, 'success');
			goto('/');
		} catch (error: any) {
			showToast(failure.title, error.message, 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-full mt-[7rem] h-full flex flex-col justify-center items-center max-sm:mb-6">
	<form class="w-[30%] max-sm:w-[90%] m-auto" on:submit={handleSubmit}>
		<h1 class="text-center w-full text-3xl mb-6 font-semibold">Create an account</h1>
		<ImageUploader {file} onLoad={setFile} />
		<div class="w-full flex gap-2">
			<label class="form_label">
				Name
				<input type="text" placeholder="John Doe" class="form_input w-full" bind:value={name} />
			</label>
			<label class="form_label">
				Username
				<input type="text" placeholder="johndoe007" class="form_input w-full" bind:value={username} />
			</label>
		</div>
		<label class="form_label">
			Email
			<input type="email" placeholder="john@example.com" class="form_input w-full" bind:value={email} />
		</label>
		<label class="form_label">
			Password
			<input type="password" placeholder="6+ characters" class="form_input w-full" bind:value={password} />
		</label>

		<button class="bg-gray-800 px-3 py-3 w-full rounded-3xl text-white font-semibold mt-4">
			{#if loading}
				<Loader />
			{:else}
				<section>Submit</section>
			{/if}
		</button>
	</form>
	<p class="mt-2">Already have an account? <a class="font-semibold underline" href="/login">Sign in</a></p>
</div>
