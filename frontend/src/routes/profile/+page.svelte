<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';
	import { UserOutline, ShoppingBagOutline, AddressCardSolid } from 'flowbite-svelte-icons';

	// inner imports
	import { authUserData } from '../../stores';
	import SideBarButton from '../../components/misc/SideBarButton/SideBarButton.svelte';
	import UserOrders from '../../components/ProfileSections/UserOrders/UserOrders.svelte';
	import UserDetails from '../../components/ProfileSections/UserDetails/UserDetails.svelte';
	import UserAddresses from '../../components/ProfileSections/UserAddresses/UserAddresses.svelte';

	// functions
	function onButtonSelect(event: any) {
		let currentlySelectedButton = String(event.target.textContent);

		buttons = _.map(buttons, (button) => ({ ...button, active: currentlySelectedButton.includes(button.text) }));
		setCurrentlySelectedPage();
	}

	function setCurrentlySelectedPage() {
		const currentlySelectedButton = _.find(buttons, (btn) => btn.active)?.text;

		if (!currentlySelectedButton) {
			currentlySelectedPage = UserDetails;

			return true;
		}

		// update currently selected page
		if (currentlySelectedButton.includes('My Orders')) {
			currentlySelectedPage = UserOrders;
		} else if (currentlySelectedButton.includes('My Addresses')) {
			currentlySelectedPage = UserAddresses;
		} else {
			currentlySelectedPage = UserDetails;
		}
	}

	// variables
	let buttons = [
		{
			text: 'My Details',
			icon: UserOutline,
			active: true
		},
		{
			text: 'My Orders',
			icon: ShoppingBagOutline,
			active: false
		},
		{
			text: 'My Addresses',
			icon: AddressCardSolid,
			active: false
		}
	];

	let currentlySelectedPage: any = UserDetails;
	const userDetails = store.get(authUserData);

	// onMount
	onMount(() => {
		if (_.isEmpty(userDetails)) {
			window.location.href = '/';
		}
	});
</script>

<section class="mt-24 max-w-[100vw] min-h-[88vh] flex flex-col justify-start items-center">
	<div class="w-[80%] mt-6">
		<h1 class="text-4xl font text-gray-800 w-full">My Account</h1>
		<div class="w-full min-h-[650px] mt-8">
			<div class="flex flex-row max-sm:flex-col justify-center items-center p-5 max-sm:p-1">
				<!-- left panel (my details, my orders) -->
				<div class="flex flex-col justify-center items-start min-w-[200px] max-sm:w-full">
					{#each buttons as button}
						<SideBarButton
							ExportedIcon={button.icon}
							text={button.text}
							onClick={onButtonSelect}
							active={button.active}
						/>
					{/each}
				</div>

				<!-- right panel -->
				<div class="flex-grow min-h-[600px] max-sm:mt-8 max-sm:w-full">
					<svelte:component this={currentlySelectedPage}></svelte:component>
				</div>
			</div>
		</div>
	</div>
</section>
