// third party imports
import _ from 'lodash';
import { toasts } from 'svelte-toasts';

export const showToast = (
	title: string,
	description: string | Array<string>,
	type: 'success' | 'error' | 'info' | 'warning'
) => {
	if (_.isArray(description)) {
		description = _.map(description, (str, idx) => `${idx + 1}: ${str}`);
		description = _.join(description, ', ');
	}

	const toast = toasts.add({
		type,
		title,
		description,
		theme: 'dark',
		duration: 10000, // 0 or negative to avoid auto-remove
		placement: 'bottom-right'
		// component: BootstrapToast, // allows to override toast component/template per toast
	});

	return toast;
};
