import { persisted } from 'svelte-persisted-store';

const initState: any = { review_product: null };

export const reviewData = persisted('review_data', initState);
