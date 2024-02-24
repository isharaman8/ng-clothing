<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { UserOutline, ShoppingBagOutline } from 'flowbite-svelte-icons';

	// inner imports
	import SideBarButton from '../../components/misc/SideBarButton/SideBarButton.svelte';
	import UserOrders from '../../components/ProfileSections/UserOrders/UserOrders.svelte';
	import UserDetails from '../../components/ProfileSections/UserDetails/UserDetails.svelte';

	// functions
	function onButtonSelect(event: any) {
		let currentlySelectedButton = String(event.target.textContent);

		buttons = _.map(buttons, (button) => ({ ...button, active: currentlySelectedButton.includes(button.text) }));
	}

	function getCurrentlySelectedPage() {
		const currentlySelectedButton = _.find(buttons, (btn) => btn.active)?.text;

		if (!currentlySelectedButton) {
			return UserDetails;
		}

		// console.log("currentlySelectedButton.includes('My Details')", currentlySelectedButton.includes('My Details'));
		// console.log("currentlySelectedButton.includes('My Orders')", currentlySelectedButton.includes('My Orders'));

		// update currently selected page

		if (currentlySelectedButton.includes('My Orders')) {
			return UserOrders;
		} else {
			return UserDetails;
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
		}
	];

	let CurrentlySelectedPage = UserDetails;
</script>

<section class="mt-24 w-[100vw] min-h-[88vh] flex flex-col justify-start items-center">
	<div class="w-[80%] mt-6">
		<h1 class="text-4xl font text-gray-800 w-full">My Account</h1>
		<div class="w-full min-h-[650px] mt-8">
			<div class="flex flex-row justify-center items-center p-5">
				<!-- left panel (my details, my orders) -->
				<div class="flex flex-col justify-center items-center">
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
				<div class="flex-grow">
					<CurrentlySelectedPage />
				</div>
			</div>
		</div>
	</div>
</section>
