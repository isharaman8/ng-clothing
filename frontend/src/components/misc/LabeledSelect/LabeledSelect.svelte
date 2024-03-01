<script lang="ts">
	// props
	export let name: string;
	export let selectValue: string;
	export let labelHeading: string;
	export let placeholder: string = '';
	export let handleOnChange: any = () => {};
	export let extraLabelClasses: string = '';
	export let options: Array<{ title: string; value: string | boolean }>;
</script>

<label class={`w-full flex justify-between items-center mt-2`}>
	<span class="text-gray-700 text-xl">{labelHeading}</span>
	<select
		{name}
		value={selectValue}
		class={`p-2 rounded-lg text-gray-6200 ${extraLabelClasses}`}
		{placeholder}
		on:change={handleOnChange}
	>
		{#each options as option}
			<option value={option.value}>{option.title}</option>
		{/each}
	</select>
</label>
