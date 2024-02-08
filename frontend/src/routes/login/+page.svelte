<script lang="ts">
	// inner imports
	import '../../styles/login_signup.css';

	import { login } from '../../helpers/auth';
	import { authUserData } from '../../stores';
	import { defaultToastMessages } from '../../constants';
	import Loader from '../../components/misc/Loader.svelte';
	import { showToast } from '../../components/misc/Toasts/toasts';

	// third party imports
	import _ from 'lodash';
	import { goto } from '$app/navigation';

	// variables
	let email = '';
	let password = '';
	let loading = false;

	// functions
	async function handleSubmit(event: Event) {
		event.preventDefault();

		let returnValue: any;

		loading = true;

		try {
			const tempValue = await login(email, password);

			if (tempValue.error) {
				throw new Error(tempValue.message);
			}

			returnValue = tempValue.data;

			authUserData.set(returnValue);

			showToast('Login Successful', 'successfully logged in', 'success');
			goto('/');
		} catch (error: any) {
			showToast(defaultToastMessages.login.failure.title, error.message, 'error');
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
		<h1 class="text-start w-full text-2xl font-semibold">Login</h1>
		<label class="form_label">
			Email
			<input type="email" placeholder="email" class="form_input" bind:value={email} />
		</label>
		<label class="form_label">
			Password
			<input type="password" placeholder="password" class="form_input" bind:value={password} />
		</label>
		<a href="/signup" class="w-full text-xs text-gray-900 text-right my-2 underline">New Account? Signup</a>
		<button class="bg-gray-800 px-3 py-2 text-white font-semibold rounded-lg mt-3">
			{#if loading}
				<Loader />
			{:else}
				<section>Submit</section>
			{/if}
		</button>
	</form>
</div>
