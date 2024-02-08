<script lang="ts">
	// inner imports
	import '../../styles/login_signup.css';

	import { signup } from '../../helpers/auth';
	import { authUserData } from '../../stores';
	import { defaultToastMessages } from '../../constants';
	import Loader from '../../components/misc/Loader.svelte';
	import { showToast } from '../../components/misc/Toasts/toasts';

	// third party imports
	import _ from 'lodash';
	import { goto } from '$app/navigation';
	import ImageUploader from '../../components/ImageUploader/ImageUploader.svelte';
	import { handleImageUpload } from '../../helpers/upload';

	// variables
	let name = '';
	let email = '';
	let password = '';
	let username = '';
	let loading = false;
	let file: File;

	$: {
		console.log('myFileWVariable changed:', file);
	}

	// functions
	async function handleSubmit(event: Event) {
		event.preventDefault();

		const { failure, success } = defaultToastMessages.signup;

		let returnValue: any;

		loading = true;

		try {
			const signupData = { name, email, password, username };
			const tempValue = await signup(signupData);

			if (tempValue.error) {
				throw new Error(tempValue.message);
			}

			returnValue = tempValue.data;

			if (!_.isEmpty(file)) {
				const returnData = await handleImageUpload(file, returnValue.auth_token);

				if (returnData.error) {
					throw new Error(returnData.message);
				}
			}

			authUserData.set(returnValue);

			showToast(success.title, success.description, 'success');
			goto('/');
		} catch (error: any) {
			showToast(failure.title, error.message, 'success');
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-[100vw] h-[100vh] flex flex-col justify-center items-center">
	<form
		class="flex flex-col justify-center items-center gap-2 rounded-lg bg-gray-300 p-8 shadow-xl"
		on:submit={handleSubmit}
	>
		<h1 class="text-start w-full text-2xl font-semibold">Signup</h1>
		<ImageUploader {file} />
		<label class="form_label">
			Email
			<input type="email" placeholder="email" class="form_input" bind:value={email} />
		</label>
		<label class="form_label">
			Password
			<input type="password" placeholder="password" class="form_input" bind:value={password} />
		</label>
		<label class="form_label">
			Username
			<input type="text" placeholder="username" class="form_input" bind:value={username} />
		</label>
		<label class="form_label">
			Name
			<input type="text" placeholder="name" class="form_input" bind:value={name} />
		</label>
		<button class="bg-gray-800 px-3 py-2 text-white font-semibold rounded-lg mt-3">
			{#if loading}
				<Loader />
			{:else}
				<section>Submit</section>
			{/if}
		</button>
	</form>
</div>
