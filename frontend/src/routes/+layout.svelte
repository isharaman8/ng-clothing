<script>
	import '../styles/app.css';
	import Navbar from '../components/Navbar/Navbar.svelte';
	import ToastContainerV1 from '../components/misc/Toasts/ToastContainerV1.svelte';

	import { toasts } from 'svelte-toasts';
</script>

<div class="app">
	<Navbar />

	<main>
		<slot />

		<ToastContainerV1 {toasts} />
	</main>
</div>

<style>
</style>
