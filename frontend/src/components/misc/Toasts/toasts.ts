import { toasts } from 'svelte-toasts';

export const showToast = (title: string, description: string, type: 'success' | 'error' | 'info' | 'warning') => {
	const toast = toasts.add({
		title,
		description,
		duration: 10000, // 0 or negative to avoid auto-remove
		placement: 'bottom-right',
		type,
		theme: 'dark'
		// component: BootstrapToast, // allows to override toast component/template per toast
	});

	return toast;
};
