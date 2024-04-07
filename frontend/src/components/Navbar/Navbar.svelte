<script lang="ts">
	// css imports
	import '../../styles/navbar.css';

	// inner imports
	import { getUrl } from './Navbar';
	import { authUserData } from '../../stores';
	import { getProducts } from '../../helpers/products';
	import { DEFAULT_PROFILE_PICTURE } from '../../constants';
	import { _getParsedProductsQuery } from '../../helpers/parser';

	// third party imports
	import _ from 'lodash';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';
	import { CartOutline, SearchOutline, AngleDownOutline, BarsOutline, UserOutline } from 'flowbite-svelte-icons';

	// variables
	let userData: any;
	let dropdownvar: any;
	let mobileDropdownvar: any;
	let searchQuery: any = '';

	$: userData = store.get(authUserData);

	// functions
	function toggleDropdownVisibility() {
		if (dropdownvar) {
			dropdownvar.classList.toggle('hidden');
		}

		if (mobileDropdownvar) {
			mobileDropdownvar.classList.toggle('hidden');
		}
	}

	function logout() {
		authUserData.set({});

		toggleDropdownVisibility();
		goto('/');
	}

	const updateAndSearchProducts = _.debounce((event: any) => {
		if (!event.target) {
			return;
		}

		searchQuery = event.target.value;
		const queryParams = _getParsedProductsQuery({ q: searchQuery });

		getProducts(queryParams);
	}, 1000);

	function debouncedUpdate(event: any) {
		updateAndSearchProducts(event);
	}

	// store subscribe
	authUserData.subscribe((value: any) => (userData = value));
</script>

<nav class="border-gray-200 fixed top-0 left-0 w-[100vw] shadow-lg backdrop-blur-2xl z-[1000] max-sm:bg-[#E4E6EE]">
	<div class="max-w-screen-xl flex sm:flex-wrap items-center justify-between mx-auto p-4 gap-8">
		<!-- mobile menu -->
		<div class="md:hidden flex items-center justify-between w-full px-2">
			<div>
				<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
					<span class="self-center text-4xl whitespace-nowrap font-extrabold">NG</span>
				</a>
			</div>

			<div class="flex gap-6 items-center relative">
				<SearchOutline class="h-8 w-6" />
				<a href={getUrl('cart')}>
					<CartOutline class="h-8 w-6" />
				</a>
	
				{#if userData.auth_token}
					<button id="dropdownNavbarLinkMobile" on:click={toggleDropdownVisibility}>
						<img
							src={userData.user.profile_picture || DEFAULT_PROFILE_PICTURE}
							alt="user profile"
							class="rounded-full w-10 h-10"
						/>
					</button>

					<!-- Dropdown menu -->
					<div
					bind:this={mobileDropdownvar}
					id="dropdownNavbarMobile"
					class="z-10 hidden absolute top-12 left-14 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-24"
				>
					<ul class="py-2 text-sm text-gray-700" aria-labelledby="dropdownLargeButton">
						<li>
							<a href="/profile" on:click={toggleDropdownVisibility} class="block px-4 py-2 hover:bg-gray-100"
								>Profile</a
							>
						</li>
					</ul>
					<div class="py-1">
						<button
							on:click={logout}
							class="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-start"
							>Sign out</button
						>
					</div>
				</div>
				{:else}
					<a href={getUrl('login')}>
						<UserOutline class="h-8 w-6"/>
					</a>
				{/if}
			</div>

		</div>

		<!-- website icon or text -->
		<a href="/" class="flex max-sm:hidden items-center space-x-3 rtl:space-x-reverse">
			<h1 class="self-center text-2xl font-semibold whitespace-nowrap">Clothing Website</h1>
		</a>

		<!-- search bar -->

		<form class="grow max-sm:hidden">
			<label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
			<div class="relative">
				<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
					<SearchOutline class="text-gray-500" />
				</div>
				<input
					type="search"
					id="default-search"
					value={searchQuery}
					on:input={debouncedUpdate}
					class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
					placeholder="Search for clothes, brands, or styles..."
					required
				/>
			</div>
		</form>

		<!-- cart and login -->
		<div class="max-sm:hidden md:block md:w-auto" id="navbar-default">
			<ul
				class="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 justify-center items-center"
			>
				<li>
					<a class="flex justify-center items-center gap-2" href={getUrl('cart')}>
						<CartOutline class="h-5" /> Cart
					</a>
				</li>
				<li>
					{#if userData.auth_token}
						<button
							id="dropdownNavbarLink"
							on:click={toggleDropdownVisibility}
							class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto"
						>
							<img
								src={userData.user.profile_picture || DEFAULT_PROFILE_PICTURE}
								alt="user profile"
								class="rounded-full w-10 h-10 mr-2"
							/>
							Hi, {userData.user.name}
							<AngleDownOutline class="size-3 ml-2" /></button
						>

						<!-- Dropdown menu -->
						<div
							bind:this={dropdownvar}
							id="dropdownNavbar"
							class="z-10 hidden absolute font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
						>
							<ul class="py-2 text-sm text-gray-700" aria-labelledby="dropdownLargeButton">
								<li>
									<a href="/profile" on:click={toggleDropdownVisibility} class="block px-4 py-2 hover:bg-gray-100"
										>Profile</a
									>
								</li>
							</ul>
							<div class="py-1">
								<button
									on:click={logout}
									class="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-start"
									>Sign out</button
								>
							</div>
						</div>
					{:else}
						<a class="flex justify-center items-center gap-2" href={getUrl('login')}> Login/Signup </a>
					{/if}
				</li>
			</ul>
		</div>
	</div>
</nav>
