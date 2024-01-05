<script>
	import '../styles/app.css';
	import Navbar from '../components/Navbar/Navbar.svelte';
</script>

<div class="app bg-white w-[100vw] min-h-[100vh]">
	<Navbar />

	<main>
		<slot />
	</main>
</div>

<style>
</style>
