<script>
	// css imports
	import '../../styles/navbar.css';

	// inner imports
	import { getUrl } from './Navbar';

	// third party imports
	import _ from 'lodash';
	import { CartOutline, SearchOutline } from 'flowbite-svelte-icons';
</script>

<nav class="border-gray-200 fixed top-0 left-0 w-[100vw] shadow-lg backdrop-blur-2xl">
	<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 gap-8">
		<!-- website icon or text -->
		<a href="http://localhost:5173" class="flex items-center space-x-3 rtl:space-x-reverse">
			<h1 class="self-center text-2xl font-semibold whitespace-nowrap">Clothing Website</h1>
		</a>

		<!-- search bar -->

		<form class="grow">
			<label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
			<div class="relative">
				<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
					<SearchOutline class="text-gray-500" />
				</div>
				<input
					type="search"
					id="default-search"
					class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
					placeholder="Search Mockups, Logos..."
					required
				/>
				<button
					type="submit"
					class="text-white absolute end-2.5 bottom-2.5 bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
					>Search</button
				>
			</div>
		</form>

		<!-- cart and login -->
		<div class="hidden w-full md:block md:w-auto" id="navbar-default">
			<ul
				class="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 justify-center items-center"
			>
				<li>
					<a class="flex justify-center items-center gap-2" href={getUrl('cart')}>
						<CartOutline class="h-5" /> Cart
					</a>
				</li>
				<li>
					<a class="flex justify-center items-center gap-2" href={getUrl('login')}> Login/Signup </a>
				</li>
			</ul>
		</div>
	</div>
</nav>
