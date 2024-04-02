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
	<form class="w-[30%] m-auto" on:submit={handleSubmit}>
		<h1 class="text-center w-full text-2xl font-semibold">Login to start shopping</h1>
		<label class="form_label">
			Email
			<input type="email" placeholder="john@example.com" class="form_input w-full" bind:value={email} />
		</label>
		<label class="form_label">
			Password
			<input type="password" placeholder="*******" class="form_input w-full" bind:value={password} />
		</label>
		<button class="bg-gray-800 px-3 py-3 w-full rounded-3xl text-white font-semibold mt-4">
			{#if loading}
			<Loader />
			{:else}
			<section>Submit</section>
			{/if}
		</button>
		<p class="mt-2 text-center">Don't have an account? <a class="font-semibold underline" href="/signup">Sign up</a></p>

	</form>
</div>
