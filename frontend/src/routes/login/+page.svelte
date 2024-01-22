<script lang="ts">
	// inner imports
	import { login } from './function';
	import '../../styles/login_signup.css';

	// third party imports
	import _ from 'lodash';
	import { page } from '$app/stores';
</script>

<div class="w-[100vw] h-[100vh] flex flex-col justify-center items-center">
	<form class="flex flex-col justify-center items-center gap-2 rounded-lg bg-gray-300 p-8 shadow-xl">
		<h1 class="text-start w-full text-2xl font-semibold">
			{(_.endsWith($page.route.id || ''), '/login' ? 'Login' : 'Signup')}
		</h1>
		<label class="form_label">
			Email
			<input type="email" placeholder="email" class="form_input" />
		</label>
		<label class="form_label">
			Password
			<input type="password" placeholder="email" class="form_input" />
		</label>
		<button class="bg-gray-800 px-3 py-2 text-white font-semibold rounded-lg mt-4">Submit</button>
	</form>
</div>
