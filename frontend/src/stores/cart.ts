import { persisted } from 'svelte-persisted-store';

const initialData: any = {};

export const cartData = persisted('cart', initialData);
