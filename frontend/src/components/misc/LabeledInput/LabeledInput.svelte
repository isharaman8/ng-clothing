<script lang="ts">
	export let name: string;
	export let value: string;
	export let labelText: string;
	export let onInput: any = () => {};
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let extraInputClasses: string = '';
	export let extraLabelClasses: string = 'w-[80%]';
</script>

<label class={`flex justify-between items-center gap-7 mb-2 ${extraLabelClasses}`}>
	<span class="text-xl text-gray-700">{labelText}</span>
	<input
		{name}
		bind:value
		{disabled}
		type="text"
		{placeholder}
		on:input={onInput}
		class={`rounded-md p-2 bg-gray-100 disabled:bg-gray-300 text-gray-800 ${extraInputClasses}`}
	/>
</label>
