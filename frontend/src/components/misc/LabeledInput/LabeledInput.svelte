<script lang="ts">
	export let name: string;
	export let value: string;
	export let labelText: string;
	export let disabled: boolean = false;
	export let onInput: any = () => {};
</script>

<label class="flex justify-between items-center gap-7 mb-2 w-[80%]">
	<h1 class="text-xl font-medium text-gray-800">{labelText}</h1>
	<input
		on:input={onInput}
		class="rounded-md p-2 bg-gray-100 disabled:bg-gray-300 text-gray-800"
		type="text"
		{name}
		bind:value
		{disabled}
	/>
</label>
