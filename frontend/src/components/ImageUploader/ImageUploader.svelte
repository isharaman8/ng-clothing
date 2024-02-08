<script lang="ts">
	import { onMount } from 'svelte';
	import { parseObject } from '../../utils';

	export let props: any = {};
	export let file: File;

	let imageSrc: string = '';
	let fileInput: HTMLInputElement | null = null;

	function handleImageChange(event: Event): void {
		file = parseObject(event.target as HTMLInputElement, {})?.files[0];

		if (!file || !file.type.startsWith('image/')) {
			return; // Show error: Please select an image file
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			imageSrc = e.target ? (e.target.result as string) : '';
			// props.onUpload(file); // Call onUpload prop with the uploaded file
		};
		reader.readAsDataURL(file);
	}

	$: {
		console.log('myFileWVariable changed:', file);
	}

	onMount(() => {
		imageSrc = props.initialSrc || 'https://via.placeholder.com/150'; // Set default image (modify as needed)
	});
</script>

<div class="flex items-center justify-center">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img
		src={imageSrc}
		alt="A fluffy orange cat sitting on a windowsill"
		class="w-32 h-32 rounded-full object-cover cursor-pointer"
		on:click={() => fileInput?.click()}
	/>

	<label
		for="fileInput"
		class="cursor-pointer hidden bg-gray-200 hover:bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded-md shadow-sm"
	>
		<input type="file" id="fileInput" accept="image/*" on:change={handleImageChange} bind:this={fileInput} hidden />
		Choose Image
	</label>
</div>
