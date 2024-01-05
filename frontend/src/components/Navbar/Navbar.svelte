<script>
	// css imports
	import '../../styles/navbar.css';

	// inner imports
	import { getUrl, CssMethods } from './Navbar';

	// third party imports
	import _ from 'lodash';
	import { page } from '$app/stores';

	// variables
	let sections = ['home'];
</script>

<nav class="border-gray-200 fixed top-0 left-0 w-[100vw] shadow-lg">
	<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
		<a href="http://localhost:5173" class="flex items-center space-x-3 rtl:space-x-reverse">
			<h1 class="self-center text-2xl font-semibold whitespace-nowrap">Clothing Website</h1>
		</a>
		<button
			data-collapse-toggle="navbar-default"
			type="button"
			class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
			aria-controls="navbar-default"
			aria-expanded="false"
		>
			<span class="sr-only">Open main menu</span>
			<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M1 1h15M1 7h15M1 13h15"
				/>
			</svg>
		</button>
		<div class="hidden w-full md:block md:w-auto" id="navbar-default">
			<ul
				class="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0"
			>
				{#each sections as section}
					<li>
						<a
							href={getUrl(section)}
							class="{CssMethods.getActiveClass(
								_.defaultTo($page.route.id, ''),
								section
							)}  capitalize text-lg block py-2 px-3 rounded md:bg-transparent md:p-0"
							aria-current="page"
						>
							{section}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>
