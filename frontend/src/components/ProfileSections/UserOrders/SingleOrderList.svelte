<script lang="ts">
	// inner imports
	import _ from 'lodash';
	import OrderStatusButton from './OrderStatusButton.svelte';

	// props
	export let idx: number;
	export let image: string;
	export let status: string;
	export let lastProduct: any;
	export let orderDate: string;
	export let totalPrice: number;
	export let productNameArray: Array<string>;
</script>

<tr class="text-gray-600">
	<td>{idx + 1}</td>
	<td class="flex justify-start items-center gap-2">
		<img class="h-10 max-w-8 mt-2" src={image} alt={lastProduct?.name} />
		{_.join(productNameArray, ', ')}
	</td>
	<td>{orderDate}</td>
	<td>Rs {totalPrice}</td>
	<td><OrderStatusButton {status} /></td>
</tr>
