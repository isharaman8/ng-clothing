import { persisted } from 'svelte-persisted-store';

const initProducts: any = [];

export const productData = persisted('products', initProducts);
