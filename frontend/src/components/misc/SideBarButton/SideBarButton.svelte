<script lang="ts">
	// inner imports
	import '../../../styles/side_bar_button.css';

	// third party imports
	import { UserSolid } from 'flowbite-svelte-icons';

	export let ExportedIcon = UserSolid;
	export let text = 'Text';
	export let onClick = (event: any): void => {};
	export let active = false;

	$: activeClass = active ? 'active-button' : 'inactive-button';
</script>

<button on:click={onClick} class={`flex justify-center items-center gap-2 p-2 w-full ${activeClass}`}>
	<ExportedIcon />
	{text}
</button>
