<script lang="ts">
	// third party imports
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import * as store from 'svelte/store';

	// inner imports
	import '../../../styles/user_orders.css';
	import { parseArray } from '../../../utils';
	import { authUserData } from '../../../stores';
	import { showToast } from '../../misc/Toasts/toasts';
	import EmptyOrderPage from './EmptyOrderPage.svelte';
	import SingleOrderList from './SingleOrderList.svelte';
	import { ORDER_TYPE_MAP } from '../../../constants/index';
	import { getUserPurchases } from '../../../helpers/purchases';
	import OrdersSkeletonLoader from '../../misc/SkeletonLoaders/OrdersSkeletonLoader.svelte';

	// functions
	function handleOrderSelect(event: any) {
		const selectedOrder = String(event.target.textContent);

		_.forEach(
			orderTypes,
			(order) => (currentlySelectedOrder = selectedOrder.includes(order) ? order : currentlySelectedOrder)
		);

		localFetchOrders();
	}

	async function localFetchOrders() {
		const order_type = _.join(_.split(_.lowerCase(currentlySelectedOrder), ' '), '_');
		const query = { page_number: currentPage, order_type: _.defaultTo(ORDER_TYPE_MAP[order_type], null) };

		ordersLoading = true;

		try {
			const tempData = await getUserPurchases(userDetails, query);

			if (tempData.error) {
				throw new Error(tempData.message);
			}

			userOrders = parseArray(tempData.data, []);

			if (_.isEmpty(userOrders) && query.page_number === 1 && currentlySelectedOrder === 'All Orders') {
				noOrdersPlaced = true;
			}
		} catch (error: any) {
			showToast('Something went wrong', error.message, 'error');
		} finally {
			ordersLoading = false;
		}
	}

	function decrementPageNumber() {
		currentPage -= 1;

		localFetchOrders();
	}

	function incrementPageNumber() {
		currentPage += 1;
		localFetchOrders();
	}

	// variables
	const userDetails = store.get(authUserData);
	const orderTypes = ['All Orders', 'Completed', 'Pending', 'Cancelled'];
	const skeletonLoaderArray = new Array(10);

	let currentPage = 1;
	let userOrders: any = [];
	let ordersLoading = false;
	let noOrdersPlaced = false;
	let currentlySelectedOrder = 'All Orders';

	// apply on mount
	onMount(localFetchOrders);
</script>

<section class="flex flex-col justify-center items-center gap-4">
	<h1 class="w-[80%] text-left text-3xl text-gray-700">My Orders</h1>

	{#if noOrdersPlaced}
		<EmptyOrderPage />
	{:else}
		<!-- order type -->
		<div class="flex flex-row justify-start items-center gap-3 w-[80%] ml-4 mt-4">
			{#each orderTypes as type}
				<button
					disabled={ordersLoading}
					on:click={handleOrderSelect}
					class={`text-sm font-medium p-2 rounded-lg ${type === currentlySelectedOrder ? 'user-order-active-button' : 'text-gray-700'}`}
					>{type}</button
				>
			{/each}
		</div>

		<!-- Purchase Table -->
		<table class="w-[80%] mt-5 purchase-table">
			<thead>
				<tr>
					<td>#</td>
					<td>Products</td>
					<td>Order Date</td>
					<td>Price</td>
					<td>Status</td>
				</tr>
			</thead>
			<tbody>
				{#if ordersLoading}
					{#each skeletonLoaderArray as _temp}
						<OrdersSkeletonLoader />
					{/each}
				{:else}
					{#each userOrders as order, idx (order.uid)}
						{@const status = order.status}
						{@const totalPrice = order.total_price}
						{@const parsedProducts = parseArray(order.products, [])}
						{@const lastProduct = parsedProducts[parsedProducts.length - 1]}
						{@const orderDate = new Date(order.created_at).toDateString()}
						{@const productNameArray = _.map(order.products, (product) => product.name)}
						{@const parsedImageArray = parseArray(lastProduct?.images, [])}
						{@const image = parsedImageArray[parsedImageArray.length - 1] || 'https://via.placeholder.com/150'}

						<SingleOrderList {status} {lastProduct} {orderDate} {productNameArray} {image} {totalPrice} {idx} />
					{/each}
				{/if}
			</tbody>
		</table>
		<div class="mt-2 w-[80%] flex justify-end items-center gap-4">
			<button
				disabled={currentPage === 1 || ordersLoading}
				on:click={decrementPageNumber}
				class="px-2 py-3 bg-red-500 disabled:bg-red-200 text-white font-medium rounded-xl">Prev</button
			>
			<h1>Page {currentPage}</h1>
			<button
				on:click={incrementPageNumber}
				disabled={userOrders.length < 10 || ordersLoading}
				class="px-2 py-3 bg-blue-500 disabled:bg-blue-200 text-white font-medium rounded-xl">Next</button
			>
		</div>
	{/if}
</section>

<!-- text-gray-700 -->
