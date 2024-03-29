import { persisted } from 'svelte-persisted-store';

const initPurchase: any = [];

export const purchaseData = persisted('purchase', initPurchase);
