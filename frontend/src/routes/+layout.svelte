<script>
	import '../styles/app.css';
	import Navbar from '../components/Navbar/Navbar.svelte';
</script>

<div class="app">
	<Navbar />

	<main>
		<slot />
	</main>
</div>

<style>
</style>
