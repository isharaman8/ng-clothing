<script>
	import '../styles/app.css';
	import Navbar from '../components/Navbar/Navbar.svelte';
	import ToastContainerV1 from '../components/misc/Toasts/ToastContainerV1.svelte';

	import { toasts } from 'svelte-toasts';
	import Footer from '../components/Footer/Footer.svelte';
</script>

<div class="app">
	<Navbar />

	<main>
		<slot />

		<ToastContainerV1 {toasts} />
	</main>

	<Footer/>
</div>

<style>
</style>
