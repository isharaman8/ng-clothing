<script lang="ts">
	import { ToastContainer, FlatToast } from 'svelte-toasts';

	let ToastContainerV1 = ToastContainer as any;

	export let toasts: any;
</script>

<ToastContainerV1 {toasts} let:data>
	<FlatToast {data} />
</ToastContainerV1>
