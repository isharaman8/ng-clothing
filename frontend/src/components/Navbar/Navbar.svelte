<script lang="ts">
	// css imports
	import '../../styles/navbar.css';

	// inner imports
	import { getUrl } from './Navbar';
	import { getProducts } from '../../helpers/products';
	import { DEFAULT_PROFILE_PICTURE } from '../../constants';
	import { _getParsedProductsQuery } from '../../helpers/parser';
	import { authUserData, cartData, productData } from '../../stores';

	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import * as store from 'svelte/store';
	import { goto } from '$app/navigation';
	import SearchBox from './SearchBox.svelte';
	import { getUserCart } from '../../helpers/cart';
	import { showToast } from '../misc/Toasts/toasts';
	import { CartOutline, SearchOutline, AngleDownOutline, UserOutline, CloseSolid } from 'flowbite-svelte-icons';

	// functions
	function toggleDropdownVisibility() {
		if (dropdownvar) {
			dropdownvar.classList.toggle('hidden');
		}

		if (mobileDropdownvar) {
			mobileDropdownvar.classList.toggle('hidden');
		}
	}

	function toggleSearchVisibility() {
		if (searchToggleVar) {
			searchToggleVar.classList.toggle('hidden');
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

	function handleOutsideClick(event: any) {
		if (!searchToggleVar) return;

		if (!event.target?.id?.toLowerCase()?.includes('search')) {
			searchToggleVar.classList.add('hidden');
			searchResultsVisible = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			toggleSearchVisibility();
		}
	}

	function handleFocus() {
		searchResultsVisible = true;
	}

	async function localGetUserCart() {
		if (_.isEmpty(userData)) return;

		cartLoading = true;

		try {
			const tempData = await getUserCart(userData);

			if (tempData.error) {
				throw new Error(tempData.message);
			}
		} catch (error: any) {
			showToast('Error fetching cart', error.message, 'error');
		} finally {
			cartLoading = false;
		}
	}

	// variables
	let userData: any;
	let dropdownvar: any;
	let cartLoading = false;
	let searchToggleVar: any;
	let searchQuery: any = '';
	let mobileDropdownvar: any;
	let searchResultsVisible: boolean = false;

	$: userCart = store.get(cartData);
	$: userData = store.get(authUserData);
	$: products = store.get(productData);

	// store subscribe
	productData.subscribe((data) => (products = data));
	cartData.subscribe((value: any) => (userCart = value));
	authUserData.subscribe((value: any) => (userData = value));

	// on mount
	onMount(() => {
		const isProfileRequest = $page.route.id?.includes('profile');

		if (_.isEmpty(userData) && isProfileRequest) {
			goto('/login');
			return;
		}

		document.body.addEventListener('click', handleOutsideClick);
		localGetUserCart();
	});
</script>

{#if $page.route.id !== '/admin/dashboard'}
	<nav class="border-gray-200 fixed top-0 left-0 w-[100vw] shadow-lg backdrop-blur-2xl z-[1000000] max-sm:bg-[#E4E6EE]">
		<div class="max-w-screen-xl flex sm:flex-wrap items-center justify-between mx-auto p-4 gap-8">
			<!-- mobile menu -->
			<div class="md:hidden flex items-center justify-between w-full px-2">
				<div>
					<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
						<span class="self-center text-4xl whitespace-nowrap font-extrabold">NG</span>
					</a>
				</div>

				<div class="flex gap-6 items-center relative">
					<span
						id="search-span"
						role="button"
						tabindex="0"
						on:keypress={handleKeyPress}
						on:click={toggleSearchVisibility}
					>
						<SearchOutline id="searchIcon" class="h-8 w-6" />
					</span>
					<a class="relative" href={getUrl('cart')}>
						<CartOutline class="h-8 w-6" />

						{#if userCart?.products?.length}
							<div
								class="flex justify-center items-center absolute top-[-6px] right-[-10px] text-[0.6rem] w-5 h-5 bg-gray-700 text-center rounded-full text-white font-semibold"
							>
								{userCart.products.length}
							</div>
						{/if}
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
							<UserOutline class="h-8 w-6" />
						</a>
					{/if}
				</div>

				<div id="searchMobile" bind:this={searchToggleVar} class="w-full absolute left-0 px-2 bg-[#E4E6EE] hidden">
					<form>
						<label for="default-search-1" class="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
						<div class="relative">
							<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
								<SearchOutline id="searchIcon" class="text-gray-500" />
							</div>
							<input
								type="search"
								id="default-search-1"
								value={searchQuery}
								on:input={debouncedUpdate}
								on:focus={handleFocus}
								class="block p-4 ps-10 w-[90%] text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Search for clothes, brands, or styles..."
								required
								autocomplete="off"
							/>
						</div>
						{#if searchResultsVisible}
							<SearchBox {products} />
						{/if}
					</form>
					<CloseSolid on:click={toggleSearchVisibility} class="text-gray-500 absolute top-4 right-4" />
				</div>
			</div>

			<!-- website icon or text -->
			<a href="/" class="flex max-sm:hidden items-center space-x-3 rtl:space-x-reverse">
				<span class="self-center text-4xl whitespace-nowrap font-extrabold">NG</span>
			</a>

			<!-- search bar -->

			<form class="grow max-sm:hidden relative">
				<label for="default-search-2" class="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
				<div class="relative">
					<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
						<SearchOutline class="text-gray-500" />
					</div>
					<input
						type="search"
						id="default-search-2"
						value={searchQuery}
						on:input={debouncedUpdate}
						on:focus={handleFocus}
						class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Search for clothes, brands, or styles..."
						autocomplete="off"
						required
					/>
				</div>
				{#if searchResultsVisible}
					<SearchBox {products} />
				{/if}
			</form>

			<!-- cart and login -->
			<div class="max-sm:hidden md:block md:w-auto" id="navbar-default">
				<ul
					class="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 justify-center items-center"
				>
					<li>
						<a class="flex justify-center items-center gap-2" href={getUrl('cart')}>
							<div class="relative">
								<CartOutline class="h-5" />

								{#if userCart?.products?.length}
									<div
										class="flex justify-center items-center absolute top-[-10px] right-[-10px] text-[0.6rem] w-5 h-5 bg-gray-700 text-center rounded-full text-white font-semibold"
									>
										{userCart.products.length}
									</div>
								{/if}
							</div>
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

	<!-- overlay  -->
	{#if searchResultsVisible}
		<div class="absolute w-screen h-screen top-0 left-0 bg-[rgba(0,0,0,0.5)] z-0"></div>
	{/if}
{/if}
