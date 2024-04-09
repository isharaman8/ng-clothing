<script lang="ts">
	// third party imports
	import countries from 'i18n-iso-countries';

	// inner imports
	import { _splitNameAndCapitalize } from '../../../utils';

	// props
	export let onClick: any = () => {};
	export let userAddressData: any = {};
	export let selectedAddress: any = null;
	export let selectForCheckout: boolean = false;
	export let handleAddressSelect: any = () => {};

	// variables
	const {
		city,
		type,
		primary,
		country,
		user_name,
		postal_code,
		contact_number,
		address_line_1,
		address_line_2,
		state_province
	} = userAddressData;

	const countryName = countries.getName(country, 'en') || country; // change logic
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={`shadow-lg flex flex-col justify-center items-start gap-3 p-5 rounded-lg cursor-pointer hover:shadow-2xl active:shadow-md relative border-2 border-neutral-300 ${userAddressData.uid === selectedAddress ? 'bg-slate-100 border-orange-500' : ''}`}
	on:click={() => (selectForCheckout ? handleAddressSelect(userAddressData) : onClick(userAddressData))}
>
	{#if primary}
		<p class="font-semibold text-green-600 absolute top-5 right-5">Primary</p>
	{/if}

	<p> <span class="font-semibold">Name:</span> {_splitNameAndCapitalize(user_name)}</p>
	<p>  <span class="font-semibold">Contact Number: </span> {contact_number}</p>
	<p>  <span class="font-semibold">Address: </span> {address_line_1}, {address_line_2}, {city}, {postal_code}, {state_province}, {countryName}</p>
	<p>  <span class="font-semibold">Address Type: </span> {type}</p>
</div>
