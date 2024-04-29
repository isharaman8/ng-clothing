<script lang="ts">
	// inner imports
	import '../../../styles/login_signup.css';

	import { login } from '../../../helpers/auth';
	import { authUserData } from '../../../stores';
	import { defaultToastMessages } from '../../../constants';
	import Loader from '../../../components/misc/Loader.svelte';
	import { showToast } from '../../../components/misc/Toasts/toasts';

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
			const tempValue = await login(email, password, 'admin');

			if (tempValue.error) {
				throw new Error(tempValue.message || '');
			}

			returnValue = tempValue.data;

			console.log('returnAdminValue', returnValue);

			authUserData.set(returnValue);

			showToast('Login Successful', 'successfully logged in', 'success');
			goto('/admin/dashboard');
		} catch (error: any) {
			showToast(defaultToastMessages.login.failure.title, error.message, 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-[100vw] h-[100vh] max-sm:h-auto max-sm:mt-28 flex flex-col justify-center items-center">
	<form class="w-[30%] max-sm:w-[90%] m-auto" on:submit={handleSubmit}>
		<h1 class="text-center w-full text-2xl font-semibold max-sm:text-3xl max-sm:mb-6">Admin Login</h1>
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
	</form>
</div>
